import { registerRootComponent } from "expo";
import App from "./App";


registerRootComponent(App);


export default function getPackageInfo() {
 
  const packageJson = require('./package.json');
  return packageJson;
}
