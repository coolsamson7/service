export interface MicrofrontendShellGeneratorSchema {
  name: string;
  generatePublicPortal?: boolean,
  generatePrivatePortal?: boolean,
  serverURL?: string,
  skipFormat?: boolean;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: 'Emulated' | 'Native' | 'None';
  routing?: boolean;
  prefix?: string;
  style?: Styles;
  skipTests?: boolean;
  directory?: string;
  //projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
  linter?: Linter;
  unitTestRunner?: UnitTestRunner;
  e2eTestRunner?: E2eTestRunner;
  //backendProject?: string;
  strict?: boolean;
  standaloneConfig?: boolean;
  port?: number;
  setParserOptionsProject?: boolean;
  skipPackageJson?: boolean;
  standalone?: boolean;
  rootProject?: boolean;
  //minimal?: boolean;
  //bundler?: 'webpack' | 'esbuild';
  //ssr?: boolean;
  //addPlugin?: boolean;
}
