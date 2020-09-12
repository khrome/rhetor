Rhetor.js
=========
(Please take a moment to read about [why this module has a name](https://github.com/khrome/story-teller/blob/master/docs/naming.md) the author despises)
A visual system for referential media against a passive text reader

StoryTeller is a system for configuring an interactive presentation around a piece of text and synchronizing that display. It includes formatters and simple meaning extraction to parse most common story formats.

Install
-------

    npm install rhetor

Including
---------

Rhetor is totally webpack compatible, or you can globally include it:

```html
<script src="https://unpkg.com/rhetor@0.0.3/dist/main.js"></script>
<script src="https://unpkg.com/rhetor-background-teller@0.0.2/dist/main.js"></script>
<script src="https://unpkg.com/rhetor-caption-teller@0.0.2/dist/main.js"></script>
```

Usage
-----

To use StoryTeller you'll need to define one or more 'personalities', which are defined by using some of the existing actions:
- [CaptionTeller](https://www.npmjs.com/package/rhetor-caption-teller) - Display the currently focused text in an overlay.
- [BackgroundTeller](https://www.npmjs.com/package/rhetor-background-teller) - Display an image background, supports a few modes:
    - a dynamic image based on the current text context
    - a sequential set of images
    - a set of actors based on scene interaction and metadata


You'll Need to add some styles:

```css
body{ margin : 0px }
#root_background{
    position:absolute;
    display: block;
    background-position: center top;
    background-size: 100% auto;
    width:100%;
    height:100%;
    z-index: 1;
}
#root_caption{
    position : absolute;
    display : block;
    width : 100%;
    bottom : 0px;
    padding : 0.5em;
    font-size: 2em;
    height : 2.5em;
    color : #DDDDDD;
    text-shadow: 1px 1px 1px black;
    background : rgba(0,0,0, 0.6);
    z-index: 2;
}
```

Then you'll need to configure a story to play:

```js
Rhetor.setRequest(request);
Rhetor.BackgroundTeller.setRequest(request);
var Story = Rhetor.story();
Story.personality('sequence', new Rhetor.MultiTeller([
    new Rhetor.CaptionTeller(),
    new Rhetor.BackgroundTeller({
        tenorApiKey : '<YOUR_TENOR_KEY>'
    })
]));
Story.tell('<file_location>', 'sequence', function(err, story){
    //the story has now been told
});
```

note that `setRequest()` witll take `request`, `browser-request` or anything request like (so as to avoid large package sizes)

Testing
-------

Roadmap
-------

Enjoy,
-Abbey Hawk Sparrow
