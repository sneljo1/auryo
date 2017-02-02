# Change Log
All notable changes to this project will be documented in this file.
## [0.8.0] -
### Added
- System media shortcut keys

### Changed
- Refactored all existing api code
- Refactoring of all backend code

### Fixed
- Automated test with CI were failing
- linux update notification

## [0.7.0] - 2016-01-21
### Added 
- ability to repost on the song page
- gradient to song & artist details page

### Changed
- improved fallback image support
- added a fixed width to the tracklist table

### Fixed
- bug where play button did not change on the track details page
- bug where switching from small to large with the info tab selected, page would be blank
- bug where reposting was not working

## [0.6.0] - 2016-12-23
### Added 
- likes to artist page
- social user profiles on artist page
- your likes page
- links to song and artist page from several location that were not connected yet

### Changed
- project restructuring (internal)
- offline bar with same as update notification
- made the description toggler on the artist page nicer

## [0.5.0] - 2016-12-11
### Added 
- auto update for windows
- update notification for linux

## [0.4.0] - 2016-12-09
### Added 
- user card to song details page
- ability to (un)follow other users
- list of comments
- basic artist details page

### Changed
- replaced react-list with npm package
- made related tracks a bit nicer

## [0.3.0] - 2016-11-19
### Added
- Title and artist to player
- Song details page
	- related tracks
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

## [0.2.0] - 2016-11-14
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

## [0.1.0] - 2016-11-13
### Added
- Music player
- Ability to scroll through stream (50 items only)
- Login window & main window

### Changed
- Project refactoring
