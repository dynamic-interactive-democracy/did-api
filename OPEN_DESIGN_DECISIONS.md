# Open Design Decisions

This document contains notes on design decisions yet to be made.
The first entries should be made as soon as possible.
The last section, Later, are decisions that are deliberately deferred for now.

## Integrating Brands

We need some information on brands that integrate using the API.
In the first case, integrating with AlleOS, we need to specify how, exactly, they integrate.

Here are the things it seems reasonable that the integrating brand provides information on (but it is not necessarily obvious if this should be passed to a frontend library or saved in the API):

- **How to display a profile page given an ID**  
  When a user clicks on a user's name, they should be shown the profile page.
  This probably makes sense to do in the frontend library.
- **How we send email to users**  
  There are several cases where we want to contact users and give them information.
  This would probably require us sending a request to some endpoint the integrating party controls.
  It should probably be saved in the API, tied to the integration user.
- **What does a link for a cirlce, accepting a circle invite, and other things look like?**  
  When we send emails, some link pattern should be used for the links we send.
  All the links should be on the integrating party's website, so they should provide them.
  Probably saved in API, tied to the integrating user.
- **What link should we use for register-and-redirect functionality?**  
  Sometimes we will want to send messages to people who are not yet users of the system.
  A link should ask them to register, and then send them to the correct page.
  Probably saved in API, tied to the integrating user.

## Links between entities

We need to somehow be able to link from a task to a topic or agreement (on top of it being tied to a circle).
It would potentially also be cool to be able to link the other way, for example in descriptions.
Trello has some pretty cool links, so maybe something like that.
But right now it's pretty open.

## Localization of default values

How do we set default values in the correct language?
A lot of texts will be language-specific, but we are not sure that all users of an integrating platform use the same langauge, so it cannot just be saved on the platform.
Do we need to save individual users' default language?
Should it be explicitly chosen on circle creation?

## Ask users for nickname to be used

Ask users for nickname they want used about them in the system (right now we only get full name).

## Later

The following points of design have deliberately been left for later.

### Overview boards

We need a board with arbitrary cards that can be dragged between columns.
New columns and cards can be created and existing ones can be removed.
On top of that we need to be able to set rules, for example limiting the deletion of some cards or columns.
And finally the boards need to be accessible programatically, as the result and ordering of the result has *meaning* to the system.

These boards are used in a lot of different places, and are probably a quite large open source project of its own.
