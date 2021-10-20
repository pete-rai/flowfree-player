# flowfree-player

> Visit my [Blog](http://pete.rai.org.uk/) to get in touch or to see demos of this and much more.

## Overview

This node module automatically plays [FlowFree](https://www.bigduckgames.com/flowfree) on a connected Android device. It can play any board size, but is limited to rectangular boards and board without obstructions. You can see it in action by watching this video:

> http://TODO

The module is implemented as a demonstration of my node module [android-automate](https://github.com/pete-rai/node-android-automate) which is available as an official node package manager repo:

> https://www.npmjs.com/package/android-automate

Using ```android-automate```, you can control any connected Android device using simple, flexible [function chains](https://en.wikipedia.org/wiki/Method_chaining). You will also find demos in there for controlling other apps, such as TikTok and Whatsapp.

The core logic for the game is provided by [Matt Zucker](https://github.com/mzucker)'s excellent Python solution. This reduces the board to a [boolean satisfiability problem](https://en.wikipedia.org/wiki/Boolean_satisfiability_problem), which is then solved using the [pycosat](https://github.com/conda/pycosat) solver.

### License

This project is available under [the MIT license](https://github.com/pete-rai/flowfree-player/blob/main/LICENSE). _Please respect the terms of the license._

### Karmaware

This software is released with the [karmaware](https://pete-rai.github.io/karmaware) tag

### Disclaimer

I've done best efforts testing on a few devices. If you find any problems, please do let me know by raising an issue [here](https://github.com/pete-rai/flowfree-player/issues). Better still, create a fix for the problem too and drop in the changes; that way everyone can benefit from it.

## Installing

Here are some notes on how you can install ```flowfree-player``` and get it running on your own device.

### Dependencies

This module has a dependency on ```node``` and on ```python```. Both must be installed and operational on your host machine. The python solver has a dependency on the ```pycosat``` library and you should install this using the ```pip``` infrastructure.

The ```android-automate``` module, also has a dependency on the Android Platform Tools. Please refer to the [Before You Start](https://github.com/pete-rai/node-android-automate#before-you-start) section of the ```android-automate``` readme to find out how to install the dependencies of that module and how to connect your target device.

### Configuration

To configure your local installation, first make a ```.env``` file, by coping the ```.env.example``` file. Then modify the entries in this file to match your local environment.

| Option  | Description |
| --- | --- |
| <tt>PYTHON_PATH</tt> | The path to your python executable. |
| <tt>SCREEN_INFO</tt> | A JSON structure outlining where the game info is on the screen of your target device. |
| <tt>SCREEN_BOARD</tt> | A JSON structure outlining where the puzzle board is on the screen of your target device. |

You can refer to the diagram below to see which rectangles you must specify in the ```SCREEN_``` options configuration.

![Example Screenshot](/docs/screenshot.png)

You can use a module option to take a screenshot of the game onto your local machine to help identify these coordinates (see next section).

### Running

To run the application, assuming you have completed all the steps in the dependency section, simply first install the required node modules:

```
npm install
```

Then run the module like this:

```
npm start
```

You can use the following to generate a local screenshot to help you configure the application, as described in the earlier section:

```
npm run screenshot
```

The screenshot will be present in the project folder as ```screenshot.png```.

Have fun!

_– [Pete Rai](http://pete.rai.org.uk/)_
