// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import { remote } from 'electron';
import jetpack from 'fs-jetpack';
import { greet } from './hello_world/hello_world';
import env from './env';

import { init } from './charting/chart';
import { buildGif } from './charting/chart';
import { buildChart } from './charting/chart';




//first, build the chart
init()



document.getElementById('btn_buildChart').addEventListener('click', buildChart)
document.getElementById('btn_buildGif').addEventListener('click', buildGif)

