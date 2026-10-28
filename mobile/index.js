/**
 * @format
 */

import { AppRegistry } from 'react-native';

import { App } from './src/app/App';
import { setupDevtools } from './src/app/devtools';
import { name as appName } from './app.json';

setupDevtools();

AppRegistry.registerComponent(appName, () => App);
