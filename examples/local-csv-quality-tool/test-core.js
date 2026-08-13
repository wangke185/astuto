const assert = require('assert');
const Core = require('./core.js');

function testDelimiterDetection() {
  assert.strictEqual(Core.detectDelimiter('a,b,c\n1,2,3\n4,5,6'), ',');
  assert.strictEqual(Core.detectDelimiter('a\tb\tc\n1\t2\t3'), '\t');
  assert.strictEqual(Core.detectDelimiter('a;b;c\n1;2;3'), ';');
}

function testQuotedParsing() {
  const parsed = Core.parseDelimited('name,note\nAlice,"hello, world"\nBob,"a ""quote"""');
  assert.deepStrictEqual(parsed.rows, [
    ['name', 'note'],
    ['Alice', 'hello, world'],
    ['Bob', 'a "quote"']
  ]);
}

function testCleaning() {
  const parsed = Core.parseDelimited(
    ' name ,status,note\n' +
    ' Alice ,NULL," hello   world "\n' +
    ' Alice ,NULL," hello   world "\n' +
    ' , , \n' +
    ' Bob ,ok,test\n'
  );
  const result = Core.cleanTable(parsed.rows, {
    firstRowHeader: true,
    trimCells: true,
    collapseWhitespace: true,
    normalizeMissing: true,
    removeEmptyRows: true,
    removeDuplicates: true
  });

  assert.deepStrictEqual(result.headers, ['name', 'status', 'note']);
  assert.deepStrictEqual(result.rows, [
    ['Alice', '', 'hello world'],
    ['Bob', 'ok', 'test']
  ]);
  assert.strictEqual(result.report.sourceRows, 4);
  assert.strictEqual(result.report.outputRows, 2);
  assert.strictEqual(result.report.emptyRowsRemoved, 1);
  assert.strictEqual(result.report.duplicatesRemoved, 1);
  assert.strictEqual(result.report.missingNormalized, 2);
}

function testHeaderNormalization() {
  assert.deepStrictEqual(
    Core.normalizeHeaders([' id ', '', 'id', 'name']),
    ['id', 'Column_2', 'id_2', 'name']
  );
}

function testCsvRoundTrip() {
  const csv = Core.toDelimited(['name', 'note'], [['Alice', 'x,y'], ['Bob', 'a"b']], ',');
  const parsed = Core.parseDelimited(csv, ',');
  assert.deepStrictEqual(parsed.rows, [
    ['name', 'note'],
    ['Alice', 'x,y'],
    ['Bob', 'a"b']
  ]);
}

function main() {
  testDelimiterDetection();
  testQuotedParsing();
  testCleaning();
  testHeaderNormalization();
  testCsvRoundTrip();
  console.log('local-csv-quality-tool: all tests passed');
}

main();
