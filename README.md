# did-api PRIO TODO

1. Circles in API
2. Topics in API
3. Convert team to circle in AlleOS (API)
4. Create circle in AlleOS (plugin)
5. Create topic in circle (plugin)
6. All steps of topic in cirlce (plugin)
7. ...

TODO: Figure out how to handle people invited by email address

# did-api endpoints/docs

## Authentication

Authentication is performed with the Basic Authentication Scheme ([RFC2617 Section 2](https://tools.ietf.org/html/rfc2617#section-2)).

`userid` refers to the `id` provided upon user creation, and `password` refers to the token returned from user creation.

The header `Authorization: Basic {base64(id:token)}` is sent as authentication.
That is, a string constructed of the id, the character `:`, then the token, all encoded as base 64.

## Data structures

### Users

The primary user data is kept in AlleOS for now.
These Users-endpoints are used to retrieve and create new user entries in this system, basically *registering that they exist*, rather than creating full profiles.

## Endpoints

### User

#### get current user
```
GET /user
Authorization: Basic `base64(id:token)`
```

Will return:
```
{
    userId: {userId},
    name: {name}
}
```

#### get current user circles

```
GET /user/circles
Authorization: Basic `base64(id:token)`
```

Will return the circles that the current user is a member of:

```
{
    //TODO
}

### Users

Creating a user returns an auth token that can be used to act as the user in the system.

### get

Users can be retrieved when authenticated as a user or when authenticated as the integrating brand itself.

```
GET /users
```

will return:

```
200 OK
{
    "users": [
        {
            "userId": {userId},
            "name": {name}
        },
        ...
    ]
}
```

### get current user
To retrieve information about the authenticated user:

```
GET /user
Authorization: Basic `base64(id:token)`
```

Will return:
```
{
    userId: {userId},
    name: {name}
}
```

### create

**todo:** Requires brand authentication

Creating single user:

```
POST /users
{
    "userId": {userId},
    "name": {name}
}
```

Will return:

```
201 CREATED
{
    "status": "User created",
    "user": {
        "token": {64 char token},
        "userId": {userId},
        "name": {name}
    }
}
```

Creating multiple users:
```
POST /users
[
    {
        "userId": {userId},
        "name": {name}
    },
    ...
]
```

Will return:

```
200 OK
{
    "status": "Users created",
    "users": [
        {
            "token": {64 char token},
            "userId": {userId},
            "name": {name}
        },
        ...
    ]
}
```


### Circles
Circles are groups of users that interact in a sociocratic manner.
These endpoints require user authentication.

#TODO: add/remove member
#TODO: accept/reject membership
#TODO: When a circle is created some standard roles are also defined.
#TODO: Procedures (strings) should also be settable on the circle.
#TODO: I am dissatisfied with the name `fullState`. --- Niels A

#### create

Creating a circle:
```

POST /circles
Authorization: Basic `base64(id:token)`
{
    "name": {nonempty string},
    "vision": {string},
    "mission": {string},
    "aim": {string},
    "fullState": {fullState:lookingForMore|openForMore|full},
    "invited": [{userId}, ...]
}
```

Will return:

```
201 CREATED
{
    "status": "Circle created",
    "circle": {
        "circleId": {uuid},
        "name": {name},
        "vision": {vision},
        "mission": {mission},
        "aim": {aim},
        "expectationsForMembers": [],
        "members": [{userId}],
        "invited": [{userId}, ...]
        "contactPerson": {userId},
        "fullState": "lookingForMore"
    }
}
```

Note: contact person starts as the creating user and as the sole member.
Only id OR email is present.
For members that are in invitationState `member` the `id` is present, not the `email`.


#### update

```
PUT /circles/:circleId
{
    "name": {nonempty string},
    "vision": {string},
    "mission": {string},
    "aim": {string},
    "contactPerson": {userId},
    "fullState": {fullState:lookingForMore|openForMore|full}
}
```

Fields left out (in Javascript, `undefined`) are not updated.
To unset a value, the field must be explicitly set to `null`.


#### get all circles

Viewing all circles:
```
GET /circles
Authorization: Basic `base64(id:token)`
```

will return:
```
200 OK
{
    "circles": [
        {
            "circleId": {circleId},
            "name": {nonempty string},
            "vision": {string},
            "mission": {string},
            "aim": {string},
            "expectationsForMembers": {expectationsForMembers},
            "members": [{userId}, ...],
            "invited": [{userId}, ...]
            "contactPerson": {userId},
            "fullState": {fullState:lookingForMore|openForMore|full}
        },
        ...
    ]
}
```

If called with either of the flags `onlyInvitedTo` and `onlyMemberOf`, the results will be limited. Eg.:

```
GET /circles?onlyMemberOf
Authorization: Basic `base64(id:token)`
```

.. will result only in circles the authenticated user is member of.

#### get a circle

Viewing a circle:
```
GET /circles/:circleId
Authorization: Basic `base64(id:token)`
```

will return:

```
200 OK
{
    "circle": {
        "circleId": {uuid},
        "name": {name},
        "vision": {vision},
        "mission": {mission},
        "aim": {aim},
        "expectationsForMembers": [],
        "members": [{userId}, ...],
        "invited": [{userId}, ...]
        "contactPerson": {userId},
        "fullState": "lookingForMore"
    }
}
```


#### delete a circle
Deleting a circle:

```
DELETE /circles/:circleId
Authorization: Basic `base64(id:token)`
```

will return:

```
204 OK
```


#### Invite a member
A member can be invited:

```
POST /circles/:circleId/members
Authorization: Basic `base64(id:token)`
{
    userId: {userId}
}
```

this will result in:

```
204 NO CONTENT
```

### Accept invitation
A member can accept a pending invitation. Only the member who was invited can accept.

```
POST /circles/:circleId/members/accept
Authorization: Basic `base64(id:token)`
```

this will result in:

```
204 NO CONTENT
```

### Remove user
A member can be removed by:

```
DELETE /circles/:circleId/members/:userId
Authorization: Basic `base64(id:token)`
```

this will result in:

```
204 NO CONTENT
```

If the user is only invited and not a member, it will also be removed.

## Role (TODO)

A role is a specification of responsibility held by a member of a group.
(Right after creation a role may be without a person tied to it.)

These endpoints require user authentication.

Any member of a role can create, edit, update roles.

### get (TODO)

```
GET /circle/{id}/roles
```

will result in:

```
200 OK
{
    "roles": [
        {
            "id": {roleId},
            "title": {string},
            "person": {userId},
            "effects": [
                "notifiedOfUpcomingDeadlines",
                "notifiedOfRequestedAgendaPoints",
                ...
            ],
            "term": {
                "start": {termStartDate},
                "end": {termEndDate}
            },
            "areaOfResponsibility": {string},
            "desiredCharacteristics": {string},
            "roleOwners": [
                {
                    "userId": {userId},
                    "term": {
                        "start": {termStartDate},
                        "end": {termEndDate}
                    }
                },
                ...
            ],
            "evaluations": [
                {
                    "date": {date},
                    "content": {string}
                },
                ...
            ],
            "elections": [
                {
                    "nominations": [
                        {
                            "nominator": {userId},
                            "nominee": {userId},
                            "changeRoundNominee": {userId}
                        },
                        ...
                    ],
                    "electee": {userId},
                    "summary": {string},
                    "state": {enum:firstRound|secondRound|completed},
                    "term": {
                        "start": {termStartDate},
                        "end": {termEndDate}
                    }
                },
                ...
            ]
        },
        ...
    ]
}
```

The `effects` tied to a role have an effect on what happens to the holder of the role.
The only two effects are listed right now.

Close to the end of a term (standard 1 month, maybe we should make this modifiable?) the roles with `notifiedOfUpcomingDeadlines` are sent an email notifying them.

Todo: Request evaluation of role.

Todo: Submit evaluation

Todo: Start/finish election.
Current person is updated once the next term starts. (shortcutted!)

### create (TODO)

Todo: ...

### edit (TODO)

Todo: ...

## Tasks (TODO)

Tasks are work units that have been agreed upon in a circle.

Todo: They may be tied to circles, topics or agreements.

### get (TODO)

```
GET /circle/{id}/tasks
```

results in

```
200 OK
{
    "tasks": [
        {
            "title": {string},
            "owner": {userId},
            "dueDate": {date},
            "description": {string},
            "aim": {string},
            "status": {status:behindSchedule|onSchedule|aheadOfSchedule},
            "attachments": [
                { objectStoredAttachment }
            ]
        },
        ...
    ]
}
```

When a `dueDate` is coming up (default 1 month before), roles with `notifiedOfUpcomingDeadlines` receive an email on this.

Todo: attachments

### create (TODO)

...

### update (TODO)

...

## Topics (TODO)

```
GET /circles/{id}/topics
```

results in

```
200 OK
{
    "topics": [
        {
            "topicId": {string},
            "canonicalTopicId": {circleId}-{topicId},
            "title": {string},
            "owner": {userId},
            "why": {string},
            "presentAtDecisionMaking": [ {id}, ... ],
            "attachments": [
                { objectStoredAttachment },
                ...
            ],
            "comments": [
                {
                    "owner": {userId},
                    "content": {string},
                    "timestamp": {timestamp}
                },
                ...
            ],
            "stage": {stage:exploration|pictureForming|proposalShaping|decisionMaking|agreement},
            "finalProposals": [
                {
                    "id": {proposalId},
                    "responsible": {userId},
                    "title": {string},
                    "aim": {string},
                    "term": {
                        "termStartDate": {termStartDate},
                        "termEndDate": {termEndDate}
                    },
                    "attachments": [
                        { objectStoredAttachment },
                        ...
                    ],
                    "relatedAgreement": {relatedAgreementId}
                },
                ...
            ]
        },
        ...
    ]
}
```

Todo: request adding to agenda notifies facilitator

Final proposals are entered in the proposal shaping stage (null before), and locked after.

If everybody agrees on a proposal (action button), an agreement is created.

If the proposal is subsequently changed, the agreement should be deleted.

Once the proposals have all been agreed to, the topic is archived and cannot be changed again.

When not everybody agrees on a proposal, a help text is shown.
There is also an option to go back to the picture forming stage (all the data is kept).

In the agreement stage, a summary of all the stage decisions is shown.

The members present at decision making are entered in the decision making stage.

### create (TODO)

...

### update (TODO)

...

## Agreements (TODO)

```
GET /circles/{id}/agreements
```

would return

```
200 OK
{
    "agreements": [
        {
            "title": {string},
            "description": {string},
            "presentAtDecisionMaking": [ {userId}, ... ],
            "missingAtDecisionMaking": [
                {
                    "id": {userId},
                    "state": {state:missing|approved|complained},
                    "complaint": {string}
                }
            ],
            "term": {
                "start": {termStartDate},
                "end": {termEndDate}
            },
            "notes": {string}
        },
        ...
    ]
}
```

The members missing are automatically calculated from the members in the circle at the time.
The missing members can later approve of the agreement, or complain (with a written reason), which notifies the facilitator (TODO).

Todo: missing member complains

Todo: notify facilitator to put on agenda

Todo: when end date nears, bring on agenda (notify facilitator)

### create (TODO)

...

### update (TODO)

...

# TODO

- Deleting things needs to be supported
- Default creations should be listed in documentation and supported in functionality. Eg.:
  - Which roles are created per default in a circle?
    What effects are tied to them?
  - What are the default texts set in roles, circles, etc. on creation?

## later

These points on the TODO are deliberately deferred for now.

- Circle: wants to interact with other circles?
- Task: create clone
- Task: subscription (add self as subscriber or unsubscribe; get updates on change)
- Topic/Agreement: create linked task (see OPEN\_DESIGN\_DECISIONS.md for more)
- Overview boards (see OPEN\_DESIGN\_DECISIONS.md for more)
- Field with "expected time to spend on this item" for each of the items (tasks, topics, agreements), used when creating an agenda.
