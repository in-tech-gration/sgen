const templateRegexes = {

  markdownTargetBlank: /\[(.*?)\]\((.*?)\)\{:target="_blank"\}/gi,
  // const [ _, linkText, URL ] = markdownTargetBlank.exec( text );

  assetsDir:          /\{\{\s?SGEN:\s?ASSETS_DIR\s?\}\}/gi,
  assetsDirDoc:       "SGEN:ASSETS_DIR",

  exercisesDir:       /\{\{\s?SGEN:\s?EXERCISES_DIR\s?\}\}/gi,
  exercisesDirDoc:    "SGEN:EXERCISES_DIR",

  assetsAsCodeRegex:  /\{\{\s?SGEN:\s?ASSETS_AS_CODE\s?\}\}/gi,
  assetsAsCodeRegexDoc: "SGEN:ASSETS_AS_CODE",

  // TODO: weekRegex will be replaced by weekFullRegex and weekNumRegex
  weekRegex:          /\{\{\s?SGEN:\s?WEEK\s?\}\}/gi,
  weekRegexDoc:       "SGEN:WEEK",

  headerImageRegex:          /\{\{\s?SGEN:\s?HEADER_IMAGE\s?\}\}/gi,
  headerImageRegexDoc:       "SGEN:HEADER_IMAGE",

  weekNumRegex:       /\{\{\s?SGEN:\s?WEEK_NUM\s?\}\}/gi,
  weekNumRegexDoc:    "SGEN:WEEK_NUM",

  weekFullRegex:      /\{\{\s?SGEN:\s?WEEK_FULL\s?\}\}/gi,
  weekFullRegexDoc:   "SGEN:WEEK_FULL",

  titleRegex:         /\{\{\s?SGEN:\s?TITLE\s?\}\}/gi,
  titleRegexDoc:      "SGEN:TITLE",

  // TODO: dayRegex will be replaced by dayFullRegex and dayNumRegex
  dayRegex:           /\{\{\s?SGEN:\s?DAY\s?\}\}/gi,
  dayRegexDoc:        "SGEN:DAY",

  dayFullRegex:       /\{\{\s?SGEN:\s?DAY_FULL\s?\}\}/gi,
  dayFullRegexDoc:   "SGEN:DAY_FULL",

  dayNumRegex:        /\{\{\s?SGEN:\s?DAY_NUM\s?\}\}/gi,
  dayNumRegexDoc:    "SGEN:DAY_NUM",


  scheduleRegex:      /\{\{\s?SGEN:\s?DAILY_SCHEDULE\s?\}\}/gi,
  scheduleRegexDoc:   "SGEN:DAILY_SCHEDULE",

  studyPlanRegex:     /\{\{\s?SGEN:\s?STUDY_PLAN\s?\}\}/gi,
  studyPlanRegexDoc:  "SGEN:STUDY_PLAN",

  summaryRegex:       /\{\{\s?SGEN:\s?SUMMARY\s?\}\}/gi,
  summaryRegexDoc:    "SGEN:SUMMARY",

  exercisesRegex:     /\{\{\s?SGEN:\s?EXERCISES\s?\}\}/gi,
  exercisesRegexDoc:  "SGEN:EXERCISES",

  extrasRegex:        /\{\{\s?SGEN:\s?EXTRAS\s?\}\}/gi,
  extrasRegexDoc:     "SGEN:EXTRAS",

  attributionsRegex:  /\{\{\s?SGEN:\s?ATTRIBUTIONS\s?\}\}/gi,
  attributionsRegexDoc: "SGEN:ATTRIBUTIONS",


  includesRegex:      /\{\{\s?SGEN:\s?INCLUDES:([^\s]+)\s?\}\}/gi,
  includesRegexDoc:   "SGEN:INCLUDES:include_name",

  // TODO: Replace (.*) with ([^\s]+) to avoid extraneous spaces:
  moduleRegex:        /( *?)\{\{\s?SGEN:\s?MODULE:(.*)\s?\}\}/gi,
  moduleRegexDoc:     "SGEN:MODULE:some/path_inside_modules/index.md",

  moduleReadRegex:    /( *?)\{\{\s?SGEN:\s?MODULE_READ:(.*)\s?\}\}/gi,
  moduleReadRegexDoc: '- [Read: **frontMatter.title**](../modules/path/to/index.md){:target="_blank"}',

  dateUpdatedRegex:   /\{\{\s?SGEN:\s?DATE_UPDATED\s?\}\}/gi,
  dateUpdatedRegexDoc: "DD/MM/YYYY",

  weeklyContentRegex: /\{\{\s?SGEN:\s?WEEKLY_CONTENT\s?\}\}/gi,
  weeklyContentRegexDoc: "SGEN:WEEKLY_CONTENT",

  meta: {
    progress: /<!-- SGEN:META:PROGRESS:(?<params>.*) -->\n/i,
    tests: /<!-- SGEN:META:TESTS:(?<params>.*) -->\n/i,
  }

}

module.exports = {
  templateRegexes,
}
