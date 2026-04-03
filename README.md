# [ChicagolandMesh.org](https://chicagolandmesh.org/)

This repository contains the source code for ChicagolandMesh.org, the official website of Chicagoland Mesh.

## About Chicagoland Mesh

We are a local community interested in decentralized networking technologies, utilizing the [Meshtastic](https://meshtastic.org/), [MeshCore](https://meshcore.co.uk/), and [Reticulum](https://reticulum.network/) open-source mesh networking protocols, to build decentralized communication networks across the Chicagoland area.

## Contributing

We welcome contributions from the community! To contribute to the website:

- Fork the repository and clone it locally.
- Create a new branch for your feature or fix.
- Ensure your changes do not damage or deface the website.
- Submitted contributions must be in Markdown format located in the `docs` directory.
- Commit your changes and push them to your fork.
- Submit a pull request to the `main` branch of our repository.

### Submitting Build Guides

We encourage users to submit their Meshtastic build guides as Markdown files.
These guides should include detailed steps, configurations, and any necessary
resources. To submit your build guide:

- Create a new Markdown file in the `docs/guides/builds` directory.
- Format your guide using Markdown syntax.
- Include images or diagrams as needed into the `docs/assets/images` directory.
- Ensure your guide is clear, concise, and informative.
- Submit a pull request to have your guide featured on our website.

## Development

Use `make build/site` to build the static site into the `dist` directory and `make dev` to start up the development server in docker.

## License

This project is licensed under the GPL-3 License.
