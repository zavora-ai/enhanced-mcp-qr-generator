# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-05-31

### Added
- Full compatibility with Model Context Protocol SDK v1.12.1
- Improved error handling for resource and tool lookups
- Better debugging and logging for MCP server operations

### Fixed
- Fixed resource registration to use string URIs instead of ResourceTemplate
- Fixed tool registration and lookup in the MCP server
- Fixed resource matching logic for proper URI resolution
- Corrected callback handling for tools and resources

### Changed
- Updated MCP server implementation to match SDK v1.12.1 requirements
- Improved internal structure for better maintainability
- Enhanced error messages for better troubleshooting

## [2.1.2] - 2025-05-15

### Added
- Support for custom logos in QR codes
- Additional color customization options

### Fixed
- Fixed margin handling in SVG output
- Improved error handling for invalid inputs

## [2.1.1] - 2025-04-28

### Fixed
- Fixed a bug with error correction levels
- Improved handling of large QR codes

## [2.1.0] - 2025-04-10

### Added
- Support for SVG output format
- Terminal-friendly QR code output

### Changed
- Improved performance for large QR codes
- Enhanced documentation

## [2.0.0] - 2025-03-15

### Added
- MCP protocol support
- Server implementation for AI assistant integration
- Health check endpoint

### Changed
- Complete architecture redesign for MCP compatibility
- New API for QR code generation

## [1.0.0] - 2025-02-01

### Added
- Initial release
- Basic QR code generation functionality
- PNG output support
- Customizable size and error correction
