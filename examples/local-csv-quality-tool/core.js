(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LocalCsvCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_MISSING_MARKERS = new Set([
    'null', 'n/a', 'na', 'none', 'nil', 'undefined', '#n/a', '(blank)'
  ]);

  function countDelimiter(line, delimiter) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') i += 1;
        else inQuotes = !inQuotes;
      } else if (!inQuotes && ch === delimiter) {
        count += 1;
      }
    }
    return count;
  }

  function detectDelimiter(text) {
    const candidates = [',', '\t', ';', '|'];
    const lines = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0)
      .slice(0, 12);

    if (!lines.length) return ',';

    let best = { delimiter: ',', score: -Infinity };
    for (const delimiter of candidates) {
      const counts = lines.map((line) => countDelimiter(line, delimiter));
      const nonZero = counts.filter((n) => n > 0);
      if (!nonZero.length) continue;
      const modeMap = new Map();
      for (const n of nonZero) modeMap.set(n, (modeMap.get(n) || 0) + 1);
      let mode = 0;
      let modeFreq = 0;
      for (const [n, freq] of modeMap.entries()) {
        if (freq > modeFreq || (freq === modeFreq && n > mode)) {
          mode = n;
          modeFreq = freq;
        }
      }
      const consistency = modeFreq / lines.length;
      const score = consistency * 100 + mode * 2 + nonZero.length;
      if (score > best.score) best = { delimiter, score };
    }
    return best.delimiter;
  }

  function parseDelimited(text, delimiter) {
    const input = String(text == null ? '' : text).replace(/^\uFEFF/, '');
    const sep = delimiter || detectDelimiter(input);
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      if (inQuotes) {
        if (ch === '"') {
          if (input[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        row.push(field);
        field = '';
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (ch === '\r') {
        if (input[i + 1] === '\n') continue;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }

    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }

    return { delimiter: sep, rows };
  }

  function normalizeHeaders(headerRow) {
    const seen = new Map();
    return (headerRow || []).map((value, index) => {
      let base = String(value == null ? '' : value).trim();
      if (!base) base = `Column_${index + 1}`;
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}_${count + 1}`;
    });
  }

  function padRows(rows, width) {
    return rows.map((source) => {
      const row = source.slice(0, width);
      while (row.length < width) row.push('');
      return row;
    });
  }

  function isEmptyRow(row) {
    return row.every((value) => String(value == null ? '' : value).trim() === '');
  }

  function cleanValue(value, options, counters) {
    let out = String(value == null ? '' : value);
    if (options.trimCells) {
      const next = out.trim();
      if (next !== out) counters.cellsTrimmed += 1;
      out = next;
    }
    if (options.collapseWhitespace && out) {
      const next = out.replace(/[ \t\f\v]+/g, ' ');
      if (next !== out) counters.whitespaceCollapsed += 1;
      out = next;
    }
    if (options.normalizeMissing && out) {
      const lowered = out.toLowerCase();
      if (DEFAULT_MISSING_MARKERS.has(lowered)) {
        counters.missingNormalized += 1;
        out = '';
      }
    }
    return out;
  }

  function profileColumn(rows, index) {
    const values = rows.map((row) => row[index] == null ? '' : String(row[index]));
    const nonEmpty = values.filter((v) => v !== '');
    const unique = new Set(nonEmpty);
    const numericCount = nonEmpty.filter((v) => {
      if (v.trim() === '') return false;
      const normalized = v.replace(/,/g, '');
      return Number.isFinite(Number(normalized));
    }).length;
    const integerCount = nonEmpty.filter((v) => /^[-+]?\d+$/.test(v.replace(/,/g, ''))).length;
    const booleanCount = nonEmpty.filter((v) => /^(true|false|yes|no|y|n)$/i.test(v)).length;

    let inferredType = 'text';
    if (nonEmpty.length > 0 && numericCount / nonEmpty.length >= 0.95) {
      inferredType = integerCount / nonEmpty.length >= 0.95 ? 'integer-like' : 'numeric-like';
    } else if (nonEmpty.length > 0 && booleanCount / nonEmpty.length >= 0.95) {
      inferredType = 'boolean-like';
    }

    return {
      rows: rows.length,
      missing: values.length - nonEmpty.length,
      nonEmpty: nonEmpty.length,
      unique: unique.size,
      inferredType
    };
  }

  function cleanTable(parsedRows, options) {
    const opts = Object.assign({
      firstRowHeader: true,
      trimCells: true,
      collapseWhitespace: true,
      normalizeMissing: true,
      removeEmptyRows: true,
      removeDuplicates: true
    }, options || {});

    const rows = (parsedRows || []).map((row) => row.map((v) => String(v == null ? '' : v)));
    if (!rows.length) {
      return {
        headers: [], rows: [], report: {
          sourceRows: 0, outputRows: 0, sourceColumns: 0,
          emptyRowsRemoved: 0, duplicatesRemoved: 0,
          cellsTrimmed: 0, whitespaceCollapsed: 0, missingNormalized: 0,
          columns: []
        }
      };
    }

    const widest = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const sourceRows = opts.firstRowHeader ? Math.max(rows.length - 1, 0) : rows.length;
    const headerSource = opts.firstRowHeader
      ? rows[0]
      : Array.from({ length: widest }, (_, i) => `Column_${i + 1}`);
    const headers = normalizeHeaders(headerSource.concat(Array(Math.max(0, widest - headerSource.length)).fill('')));
    const dataRows = opts.firstRowHeader ? rows.slice(1) : rows.slice();
    const normalizedRows = padRows(dataRows, headers.length);

    const counters = {
      emptyRowsRemoved: 0,
      duplicatesRemoved: 0,
      cellsTrimmed: 0,
      whitespaceCollapsed: 0,
      missingNormalized: 0
    };

    const cleaned = [];
    const seen = new Set();
    for (const row of normalizedRows) {
      const next = row.map((value) => cleanValue(value, opts, counters));
      if (opts.removeEmptyRows && isEmptyRow(next)) {
        counters.emptyRowsRemoved += 1;
        continue;
      }
      if (opts.removeDuplicates) {
        const key = JSON.stringify(next);
        if (seen.has(key)) {
          counters.duplicatesRemoved += 1;
          continue;
        }
        seen.add(key);
      }
      cleaned.push(next);
    }

    const columns = headers.map((name, index) => Object.assign({ name }, profileColumn(cleaned, index)));
    return {
      headers,
      rows: cleaned,
      report: Object.assign({
        sourceRows,
        outputRows: cleaned.length,
        sourceColumns: headers.length,
        columns
      }, counters)
    };
  }

  function csvEscape(value, delimiter) {
    const text = String(value == null ? '' : value);
    if (text.includes('"') || text.includes('\n') || text.includes('\r') || text.includes(delimiter)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function toDelimited(headers, rows, delimiter) {
    const sep = delimiter || ',';
    const allRows = [headers].concat(rows || []);
    return allRows.map((row) => row.map((v) => csvEscape(v, sep)).join(sep)).join('\r\n');
  }

  function buildQualityReport(fileName, delimiter, result) {
    return {
      generatedAt: new Date().toISOString(),
      fileName: fileName || 'data.csv',
      detectedDelimiter: delimiter === '\t' ? 'TAB' : delimiter,
      summary: {
        sourceRows: result.report.sourceRows,
        outputRows: result.report.outputRows,
        columns: result.report.sourceColumns,
        emptyRowsRemoved: result.report.emptyRowsRemoved,
        duplicatesRemoved: result.report.duplicatesRemoved,
        cellsTrimmed: result.report.cellsTrimmed,
        whitespaceCollapsed: result.report.whitespaceCollapsed,
        missingMarkersNormalized: result.report.missingNormalized
      },
      columns: result.report.columns
    };
  }

  return {
    detectDelimiter,
    parseDelimited,
    normalizeHeaders,
    cleanTable,
    toDelimited,
    buildQualityReport
  };
});
