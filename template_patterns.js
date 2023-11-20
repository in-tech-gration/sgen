const templateRegexes = {

  markdownTargetBlank: /\[(.*?)\]\((.*?)\)\{:target="_blank"\}/gi,
  // const [ _, linkText, URL ] = markdownTargetBlank.exec( text );

  assetsDir:          /\{\{\s?SGEN:\s?ASSETS_DIR\s?\}\}/gi,
  exercisesDir:       /\{\{\s?SGEN:\s?EXERCISES_DIR\s?\}\}/gi,
  assetsAsCodeRegex:  /\{\{\s?SGEN:\s?ASSETS_AS_CODE\s?\}\}/gi,
  // TODO: weekRegex will be replaced by weekFullRegex and weekNumRegex
  weekRegex:          /\{\{\s?SGEN:\s?WEEK\s?\}\}/gi,
  weekNumRegex:       /\{\{\s?SGEN:\s?WEEK_NUM\s?\}\}/gi,
  weekFullRegex:      /\{\{\s?SGEN:\s?WEEK_FULL\s?\}\}/gi,
  titleRegex:         /\{\{\s?SGEN:\s?TITLE\s?\}\}/gi,
  // TODO: dayRegex will be replaced by dayFullRegex and dayNumRegex
  dayRegex:           /\{\{\s?SGEN:\s?DAY\s?\}\}/gi,
  dayFullRegex:       /\{\{\s?SGEN:\s?DAY_FULL\s?\}\}/gi,
  dayNumRegex:        /\{\{\s?SGEN:\s?DAY_NUM\s?\}\}/gi,
  scheduleRegex:      /\{\{\s?SGEN:\s?DAILY_SCHEDULE\s?\}\}/gi,
  studyPlanRegex:     /\{\{\s?SGEN:\s?STUDY_PLAN\s?\}\}/gi,
  summaryRegex:       /\{\{\s?SGEN:\s?SUMMARY\s?\}\}/gi,
  exercisesRegex:     /\{\{\s?SGEN:\s?EXERCISES\s?\}\}/gi,
  extrasRegex:        /\{\{\s?SGEN:\s?EXTRAS\s?\}\}/gi,
  attributionsRegex:  /\{\{\s?SGEN:\s?ATTRIBUTIONS\s?\}\}/gi,
  includesRegex:      /\{\{\s?SGEN:\s?INCLUDES:(.*)\s?\}\}/gi,
  moduleRegex:        /( *?)\{\{\s?SGEN:\s?MODULE:(.*)\s?\}\}/gi,
  dateUpdatedRegex:   /\{\{\s?SGEN:\s?DATE_UPDATED\s?\}\}/gi,
  weeklyContentRegex: /\{\{\s?SGEN:\s?WEEKLY_CONTENT\s?\}\}/gi,
  meta: {
    progress: /<!-- SGEN:META:PROGRESS:(?<params>.*) -->\n/i,
    tests: /<!-- SGEN:META:TESTS:(?<params>.*) -->\n/i,
  }

}

module.exports = {
  templateRegexes,
}
