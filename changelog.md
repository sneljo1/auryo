# Change Log
All notable changes to this project will be documented in this file.

## [1.4.1] - The Queue update
*2017-09-30*
### Added
- Touchbar integration
- Like, repost, add to playlist actions to track grid view
- Queue & add up next feature
- repeat feature

### Changed
- UI improvements & tweaks

### Fixed
- Issue #49
- Issue #47
- Issue #46
- Partial Issue #34
- bug where window didn't re-open on mac
- (Linux) crash when playing certain tracks
- other minor bug fixes & overal improvements


## [1.3.0] - 2017-08-22
### Added
- fundamentals for touchbar integration (not yet fully implemented)
- Linux mpris integration

### Changed
- refactoring backend

### Fixed
- playlist stopped when playing playlists
- Issue #39
- Issue #33
- Issue #32
- Issue #42
- Issue #37
- Properly fixed issue #37
- windows integration
- small css bugs

## [1.2.1] - 2017-08-14
### Fixed
- Issue #35
- Issue #37
- Issue #38
- Issue #40

## [1.2.0] - 2017-08-13
### Changed
- Improved error handling
- Improved search interface
- Improved top bar
- switched some icons
- hidden follow button on your own profile

## [1.1.0] - 2017-08-13
### Added
- better exception handling

### Changed
- refactoring
- package updates

## [1.0.0] - 2017-08-12
### Fixed
- refactoring
- bug fixes

## [0.9.0] - 2017-06-21
### Added
- search bar
- ability to add music to playlist

### Changed
- significantly reduced launcher size

### Fixed
- refactoring
- bug fixes

## [0.8.0] - 2017-03-28
### Added
- System media shortcut keys

### Changed
- Refactored all existing api code
- Refactoring of all backend code
- Redone authentication

### Fixed
- Automated test with CI were failing
- linux update notification
- minor bugs

## [0.7.0] - 2017-01-21
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
