export class MosaicAdditionalDefinition {
    constructor(
        public issuer: string,
        public unit?: string
    ) { }

    public static getImageUrl(name?: string) {
        if (!name) {
            return "assets/data/mosaic.svg";
        }
        return "assets/data/" + name.replace(":", "/") + ".svg";
    }
}