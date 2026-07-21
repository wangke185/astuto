<p align="center">
  <img width="400" src="./images/logo-and-name.png" />
</p>
<p align="center">
  <a href="https://www.producthunt.com/posts/astuto?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-astuto" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=179870&theme=neutral&period=daily" alt="Astuto - An open source customer feedback tool 🦊 | Product Hunt Embed" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

### 👋🏻 Astuto is not maintained anymore! See [this issue](https://github.com/astuto/astuto/issues/487). Thanks everyone for the support :)

Astuto is an open source customer feedback tool. It helps you collect, manage and prioritize feedback from your customers, so you can build a better product.

<img src="./images/hero-image.png" />

## Unofficial rescue fork

This repository is an unofficial maintenance demonstration fork. It is not affiliated with, endorsed by, or presented as the official continuation of Astuto.

The `rescue-v1.0.0` snapshot contains a bounded webhook reliability, target-security, test-coverage, and deployment-credential hardening exercise. It is preserved as a software-project rescue case rather than a commercial relaunch.

- [Astuto Webhook Rescue Case Study](./docs/case-studies/astuto-webhook-rescue.md)
- [Software Project Rescue Checklist](./docs/project-rescue-checklist.md)
- [Software Project Rescue Service](./docs/services/software-rescue-offer.md)
- [Rescue v1.0.0 Release Notes](./docs/releases/rescue-v1.0.0.md)

The work does not represent a complete security audit. Review the stated limitations before considering production use.

## Features

- **Roadmap**: show users what you're working on
- **Simple Sign In**: let users log in with email or any OAuth2 provider
- **Webhooks**: integrate with your existing tools (e.g. Jira, Trello, Slack)
- **API**: programmatically manage your feedback space with our REST API
- **Moderation Queue**: decide whether to show new feedback immediately or request approval
- **Anonymous Feedback**: enable unregistered users to publish feedback
- **... and more**: invitation system, brand customization, recap emails for administrators, private site settings, and more!

## Documentation

Documentation website is not online anymore. You can read Astuto's documentation from the [GitHub repository](https://github.com/astuto/astuto-docs).

## Get started

0. Ensure you have Docker and Docker Compose installed
1. Create an empty folder
2. Inside that folder, create a `docker-compose.yml` file with the following content:
```
services:
  db:
    image: postgres:14.5
    environment: &db-env
      POSTGRES_USER: yourpostgresusername
      POSTGRES_PASSWORD: yourpostgrespassword
    volumes:
      - dbdata:/var/lib/postgresql/data
  web:
    image: riggraz/astuto:latest
    environment:
      <<: *db-env
      BASE_URL: http://yourwebsite.com
      SECRET_KEY_BASE: yoursecretkeybase
      DEFAULT_ADMIN_EMAIL: admin@example.com
      # Optional. If omitted, a unique password is generated and printed once in the web container logs.
      DEFAULT_ADMIN_PASSWORD: your-strong-unique-password
    ports:
      - "3000:3000"
    depends_on:
      - db
    
volumes:
  dbdata:
```
3. Edit the environment variables to fit your needs. Use unique, high-entropy values for `POSTGRES_PASSWORD`, `SECRET_KEY_BASE`, and `DEFAULT_ADMIN_PASSWORD`.
4. Run `docker compose pull && docker compose up`
5. You should now have a running instance of Astuto on port 3000. The initial owner email is set by `DEFAULT_ADMIN_EMAIL`. The password is taken from `DEFAULT_ADMIN_PASSWORD`; when that variable is blank or omitted, a random password is printed once during database seeding. Existing databases and existing owner credentials are not changed.

> Note: the upstream Docker image referenced above is not rebuilt or published by this rescue fork. Building and operating the modified source requires an independent deployment review.

## Contributing

There are many ways to contribute to Astuto, not just coding. Proposing features, reporting issues, translating to a new language or improving documentation are a few examples! Please read the upstream [contributing guidelines](https://github.com/riggraz/astuto/blob/main/CONTRIBUTING.md) to learn more.

## Credits

Astuto logo and all image assets are credited [here](https://github.com/astuto/astuto-io/blob/main/src/pages/Credits.jsx).

A huge thank you to code contributors

<a href="https://github.com/riggraz/astuto/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=riggraz/astuto" />
</a>

and [translation contributors](https://crowdin.com/project/astuto/members)!