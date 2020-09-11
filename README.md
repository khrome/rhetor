StoryTeller.js
==============
A visual system for referential media against a passive text reader

StoryTeller is a system for configuring an interactive presentation around a piece of text and synchronizing that display. It includes formatters and simple meaning extraction to parse most common story formats.

Install
-------

    npm install story-teller

Usage
-----

To use StoryTeller you'll need to define one or more 'personalities', which are defined by using some of the existing actions:
[CaptionTeller](https://www.npmjs.com/package/story-caption-teller) - Display the currently focused text in an overlay.
[BackgroundTeller](https://www.npmjs.com/package/story-background-teller) - Display an image background, supports a few modes:
    - a dynamic image based on the current text context
    - a sequential set of images
    - a set of actors based on scene interaction and metadata

Testing
-------

Roadmap
-------

Enjoy,
-Abbey Hawk Sparrow