NPM Naming
==========

It's always just been a matter of checking `https://www.npmjs.com/package/<name>`, then getting functional code in the repo before someone else claims your name (yes, it's happened once or twice). But somewhere along the way a desire to prevent typosquatting (which I'm unconvinced represents a tangible, rather than just a perceived [mostly by microsoft](https://www.searchenginepeople.com/blog/tposquatting.html), threat which is mostly used as a [cudgel against small and independent business owners](https://www.digest.com/Big_Story.php) ). It's no coincidence this policy began after NPM engaged large organizations to try and sell itself.

Any large corporation is going to have LICENSE enforcement, so there's no potential for confusion beyond wondering why the module you installed isn't there or the module you just imported is undefined. It *ONLY* protects against the bad actor forging a copycat package with nefarious intent.

If the objective is truly clarity and "helping me with visibility" changing the NOT FOUND page to indicate it intersects with a valid package would be step 1, right?.

So instead I have the option to use a namespace and bury it's visibility, or hit a thesaurus and use incorrect, not-quite-right words to further make words meaningless. So a thesaurus it is... but then you find all the words that anyone is familiar with are long taken for projects that have nothing at all to do with the word in question other than as some kind of inspirational symbol.

So after writing this module as `story-teller`, which is wide open... I go to publish and get an error because there is a module I was unaware of, `storyteller`.

So given that I have (rather annoyingly) been asked to give up some module names in the past, I figured asking them to enable that wouldn't be a big issue, given that I'm a new module and the other module has been inactive for 5 years.

But when I get a reply it's practically a form letter, but it tells me I *do* have the option to dispute ownership like a passive aggressive asshole. From being on the other side of this I know that if I had not responded in 30 days the would have reclaimed the module, with all the breakages that entails.

There is literally no chance I'd do that to another developer, and I think it's really fucked up that they're using devs as a garbage reclamation system and just figuring is no one says anything, it must be OK.

This leads to backbiting, conflict, friction and flux.

It will end with all of NPM getting re-namespaced to have no globals and open source devs will move to something like Entropic (which I'm already considering)... and this is a person who stuck with npm through the yarn days where every npm command would break all your dev links.

Last I'd like to make a point about the options left to me as a developer... when I use similar words I come up with:
- https://www.npmjs.com/package/narrative
- https://www.npmjs.com/package/rant
- https://www.npmjs.com/package/storyteller
- https://www.npmjs.com/package/spiel
- https://www.npmjs.com/package/account
- https://www.npmjs.com/package/anecdote
- https://www.npmjs.com/package/chronicle
- https://www.npmjs.com/package/history
- https://www.npmjs.com/package/yarn
- https://www.npmjs.com/package/narrator
- https://www.npmjs.com/package/raconteur
- https://www.npmjs.com/package/relater
- https://www.npmjs.com/package/reporter
- https://www.npmjs.com/package/chronicler
- https://www.npmjs.com/package/lector

The only things left are loan words which are total appropriations of of meanings I don't even correctly comprehend, so I'm using the greek word, because I feel least uncomfortable with that (as compared to other available terms like `kathakar` or `griot`). These actions may be minor individually, but I think in aggregate they represent a cowardice in policymaking to avoid conflict, which ultimately puts users in conflict with one another and gives large organizations undue influence, but most importantly, pushes names further from *meaning*.

But given npm is now owned by a company owned by the company that thinks this is a swell idea, I'd expect no change.

:P
