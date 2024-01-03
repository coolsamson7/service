/**
 * this interface covers the strategy how missing translation values should appear on screen.
 */
export abstract class MissingTranslationHandler {
  /**
   * return a string that will be shown for the requested i18n key in case of missing translations.
   * @param key the i18n key
   */
  abstract resolve(key : string) : string;
}
