# SGEN Change Log

## Branch: v2

### 22/01/2024

- Merged changes from `main` branch's commit with id `0e005c2` from 21/01/2024
- Started making unit tests for `utils.js` functions:
    - 3 tests for 'getFrontMatterStringFromObject'
    - 3 tests for 'parseWdxMetaProgress'
    - 2 tests for 'parseWdxMetaTests'
- Removed redundant functions from `utils.js`

### 17/01/2024

Moved all functions from file `utils/index.js` into `utils.js` since we had 2 different files with utility functions.

- Deleted `utils/index.js`
- Renamed `utils/index.test.js` -> `tests/utils.test.js`
- Updated imports to files: `daily.js`, `sgen.js`, `weekly.js`

### 16/01/2024

The changes below were made in order to properly create progress sheets and tests from imported/included modules as links.

- `utils.js`
    - New function `parseTagsFromLinkToModule` added, in order to search a markdown token for link(s) to module and parse
    said links for {{ SGEN }} tags. Current tags supported: SGEN:META:PROGRESS, SGEN:META:TESTS
- `daily.js`
    - Calls `parseTagsFromLinkToModule` for each markdown token on each daily markdown

### 15/01/2024

The changes below were made to apply to the new format of the .yaml config files like the one found below: 

```yaml
input: curriculum/schedule/weekly.draft.md
daily_input: curriculum/schedule/daily.draft.md
title: HTML - Accessibility - Git
schedule: 
  days:
    # file://./_day01.md
    1: _day01.md
    # file://./_day02.md
    2: _day02.md
    # file://./_day03.md
    3: _day03.md
    # file://./_day04.md
    4: _day04.md
    # file://./_day05.md
    5: _day05.md
```

- `constants.js`
    - `SCHEDULE_FOLDER` containing value: `path**.**join("curriculum", "schedule")`
- `sgen.js`
    - New global value inside `sgenConfig` created, named `scheduleFolder`
        - default initialized to value of constant `SCHEDULE_FOLDER`
        - can be set via `-s/--schedule <folder>`   command line option
- `weekly.js`
    - Check for `dailyModuleFolder` added, since new yaml format does not contain a `module` variable under each day
- `daily.js`
    - New function `parseDailyEntry` created to properly parse the entries of the days yaml variable containing:
        - a filename, expecting it to be inside `SCHEDULE_FOLDER/weekXX/` folder
        - module directory or `index.md` of a module, as used in the LEGACY version