export let lang = window.navigator.language.substr(0, 2) == "ja" ? "ja" : "en";

export function setLang(value: string) {
  lang = value;
}