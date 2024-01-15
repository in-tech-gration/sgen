# SGEN Change Log

## Branch: v2

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

- `constastants.js`
    - `SCHEDULE_FOLDER` containing value: `path**.**join("curriculum", "schedule")`
- `sgen.js`
    - New global vaule inside `sgenConfig` created, named `scheduleFolder`
        - default initiliazed to value of constant `SCHEDULE_FOLDER`
        - can be set via `-s/--schedule <folder>`   command line option
- `weekly.js`
    - Check for `dailyModuleFolder` added, since new yaml format does not contain a `module` variable under each day
- `daily.js`
    - New function `parseDailyEntry` created to properly parse the entries of the days yaml variable containing:
        - a filename, expecting it to be inside `SCHEDULE_FOLDER/weekXX/` folder
        - module directory or `index.md` of a module, as used in the LEGACY version