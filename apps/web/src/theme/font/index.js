import FontSizeFactory from "./fontsize";

class FontFactory {
  constructor(scale) {
    return {
      fontSizes: new FontSizeFactory(scale),
      fontWeights: {
        normal: 400,
        body: 400,
        heading: 700,
        bold: 600,
      },
      fonts: {
        body: `Open Sans,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Oxygen-Sans,Ubuntu,Cantarell,sans-serif;`,
        heading: `Open Sans,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Oxygen-Sans,Ubuntu,Cantarell,sans-serif;`,
      },
    };
  }
}
export default FontFactory;
