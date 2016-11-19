# Change Log
All notable changes to this project will be documented in this file.

## [1.2.0] - 2016-11-19
### Added
- Title and artist to player
- Song details page
	- related tracks
	- comments
	- liking
- added next and previous buttons to navigate through the app
	

### Changed
- made volume vertical instead of horizontal to save some space
- refactored project to be more modular
- switch from vanilla material icons to iconmoon
- replaced audio player with own implementation because of slow speed with long songs
- refactor to use sass
- keep volume bar visible untill user is done seeking
- changed image on offline page to something more music like

### Fixed
- fixed issue with infinity scroll not adapting when resizing
- added custom version of react-list with bug fix untill they accept my pull request

## [1.1.0] - 2016-11-14
### Added
- volume adjustment for player
- infinity scroll for stream with lazy loading
- custom window controls
- material icons
- offline page

### Changed
- Improved code for switching between logout & loging back in
- Replaced sound-react with custom implementation because it had a bug
- changed the accent color

### Fixed
- enhanced the performance for seeking through a song

## [1.0.0] - 2016-11-13
### Added
- Music player
- Ability to scroll through stream (50 items only)
- Login window & main window

### Changed
- Project refactoring

