# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-10

### Added
- Initial release of Clean Done Todos plugin
- Age-based cleanup functionality for completed checklist items
- Embedded button support for in-note cleanup
- Command palette integration
- Settings tab for configuring day threshold
- Support for pattern: `- [x] Task description ✅ YYYY-MM-DD`
- Non-destructive operation (only affects current note)

### Features
- Configurable day threshold (default: 5 days)
- Works with both Reading View and Live Preview
- Regex-based pattern matching for reliable detection
- Uses Moment.js for robust date handling
- Real-time settings updates without restart

### Technical
- Built with TypeScript
- Compatible with Obsidian v0.15.0+
- Uses esbuild for compilation
- Follows Obsidian plugin development standards