# sgen

  Syllabus Generation Tool

  **Usage:**

  `sgen curriculum.yaml`

  `sgen week01.yaml` or just `sgen 1`

## Development

  - `git clone git@github.com:in-tech-gration/sgen.git`
  - `cd sgen`
  - `npm install`
  - `npm link`
  - `sgen --version`

## Template Patterns

  - `{{ SGEN:ASSETS_DIR }}` -> `curriculum/week<NUM_OF_WEEK>/assets`
  - `{{ SGEN:ASSETS_AS_CODE }}` -> `<GITHUB_BLOB_URL>curriculum/week<NUM_OF_WEEK>/assets`
  - `{{ SGEN:EXERCISES_DIR }}` -> `curriculum/week<NUM_OF_WEEK>/exercises`

  ---

  - `{{ SGEN:WEEK }}` -> `Week <NUM_OF_WEEK>`
  - `{{ SGEN:WEEK_FULL }}` -> `Week <NUM_OF_WEEK>`
  - `{{ SGEN:WEEK_NUM }}` -> `<NUM_OF_WEEK>`
  - `{{ SGEN:TITLE }}` -> `<FRONTMATTER_TITLE`
  - `{{ SGEN:DAY }}` -> `Day <NUM_OF_DAY>`
  - `{{ SGEN:DAY_FULL }}` -> `Day <NUM_OF_DAY>`
  - `{{ SGEN:DAY_NUM }}` -> `<NUM_OF_DAY>`
  - `{{ SGEN:DATE_UPDATED }}` -> `DD/MM/YYYY`

  ---

  - `{{ SGEN:DAILY_SCHEDULE }}` -> Replaced with content inside section `### Schedule`
  - `{{ SGEN:STUDY_PLAN }}` -> Replaced with content inside section `### Extra Resources`
  - `{{ SGEN:SUMMARY }}` -> Replaced with content inside section `### Study Plan`
  - `{{ SGEN:EXERCISES }}` -> Replaced with content inside section `### Summary`
  - `{{ SGEN:EXTRAS }}` -> Replaced with content inside section `### Exercises`
  - `{{ SGEN:ATTRIBUTIONS }}` -> Replaced with content inside section `### Sources and Attributions`

  ---

  - `{{ SGEN:INCLUDES:<FILE_NAME> }}` -> Replaced with content found inside `curriculum/schedule/includes/<FILE_NAME>.md`
  - `{{ SGEN:MODULE:some/path_inside_modules/index.md }}` -> Replaced with content found inside `some/path_inside_modules/index.md`
  - `{{ {{ SGEN:MODULE_READ:path/to/index.md }} }}` -> Replaced with `  - [Read: **<FRONTMATTER_TITLE>**](../modules/path/to/index.md}){:target="_blank"}`
  - `{{ SGEN:WEEKLY_CONTENT }}` -> Replaced with content from all days specified inside a `weekXX.yaml` configuration file

  ---

  The markdown comments found below can be used to generate progress sheet entries and tests for exercises

### Comment for Progress Entry

  - `<!-- SGEN:META:PROGRESS:<params> -->`
    - `<params>` -> `param_name=<PARAM_CONTENT>` (separated by `|`)
      - `task=<TASK>`: required
      - `user_folder=<FOLDER_NAME>`
    - Replaced with empty string and inserts `<WEEK_NUM>,<DAY_NUM>,<WEEK_TITLE>: <DAY_TITLE>,<TASK>,<LEVEL>,0-10,FALSE,<INSTRUCTIONS>` to `user/week<WEEK_NUM>/progress/progress.draft.w<WEEK_NUM>.d<DAY_NUM>.csv` file.
      - `<WEEK_NUM>` -> Num of current week
      - `<DAY_NUM>` -> Num of current day
      - `<WEEK_TITLE>` -> Title of current week
      - `<DAY_TITLE>` -> Title of current day
      - `<LEVEL>` -> 'Beginner', 'Intermediate' or 'Advanced'
      - `<INSTRUCTIONS>` -> `Update FALSE to TRUE in the COMPLETED column` or `Upload the required assets to the user/week<WEEK_NUM>/exercises/day<DAY_NUM>/<FOLDER_NAME>/ folder`

### Comment for Test Generation

  - `<!-- SGEN:META:TESTS:<params> -->`
    - `<params>` -> `param_name=<PARAM_CONTENT>` (separated by `|`)
      - `name=<NAME>`: required
      - `type=<TYPE>`: required (Available types: `exist`)
      - `user_folder=<FOLDER_NAME>`: required
      - `files=<FILENAMES>`: required (Filenames separated by comma e.g. `file1.js,file2.js`)
    - Replaced with empty string and creates `w<WEEK_NUM>-d<DAY_NUM>-<FOLDER_NAME>.yaml` to `.github/workflows/` folder. The content of the generated file is a the template shown below
    
  ```yaml
  name: "Week <WEEK_NUM> - Day <DAY_NUM> <WEEK_TITLE> | <NAME>"
  on:
    push:
      branches:
        - 'main'
      paths:
        - user/week<WEEK_NUM>/exercises/day<DAY_NUM>/<FOLDER_NAME>/**
  jobs:
    fetch_basics:

      runs-on: ubuntu-latest

      steps:
        - name: Checkout code
          uses: actions/checkout@v3

        - name: "<NAME> > Check solution files existence"
          uses: andstor/file-existence-action@v2
          with:
            files: "user/week<WEEK_NUM>/exercises/day<DAY_NUM>/<FOLDER_NAME>/<FILENAMES>, user/week<WEEK_NUM>/exercises/day<DAY_NUM>/<FOLDER_NAME>/<FILENAMES>"
            fail: true
  ```
