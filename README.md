# did-api endpoints

## Users

The primary user data is kept in AlleOS for now.
These Users-endpoints are used to retrieve and create new user entries in this system, basically *registering that they exist*, rather than creating full profiles.

Creating a user returns an auth token that can be used to act as the user in the system.

### get (TODO)

Users can be retrieved when authenticated as a user or when authenticated as the integrating brand itself.

```
GET /users
```

will return:

```
200 OK
{
    "users:" [
        {
            "userId": {id},
            "name": {name}
        },
        ...
    ]
}
```

### create

**todo:** Requires brand authentication

Creating single user:

```
POST /users
{
    "id": {id},
    "name": {name}
}
```

Will return:

```
200 OK
{
    "status": "User created",
    "user": {
        "token": {64 char token},
        "userId": {id},
        "name": {name}
    }
}
```


Creating multiple users:
```
POST /users
[
    {
        "id": {id},
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
            "userId": {id},
            "name": {name}
        },
        ...
    ]
}
```

## Circles (TODO)

Cirlces are groups of users that interact in a sociocratic manner.

These endpoints require user authentication.

TODO: Procedures (strings) should also be settable on the circle.

### get all

```
GET /circles
```

returns

```
{
    "circles": [
        {
            "id": {circleId},
            "name": {nonempty string},
            "vision": {string},
            "mission": {string},
            "aim": {string},
            "expectationsForMembers": {expectationsForMembers},
            "members": [
                {
                    "id": {userId},
                    "email": {email},
                    "invitationState": {invitationState:invited|member}
                },
                ...
            ],
            "contactPerson": {userId},
            "fullState": {fullState:lookingForMore|openForMore|full}
        },
        ...
    ]
}
```

Only id OR email is present.
For members that are in invitationState `member` the `id` is present, not the `email`.

**TODO**: accept/reject membership

### create (TODO)

```
POST /circles
{
    "name": {nonempty string},
    "vision": {string},
    "mission": {string},
    "aim": {string},
    "expectationsForMembers": {expectationsForMembers},
    "members": [
        {
            "id": {id},
            "email": {email}
        },
        ...
    ],
    "fullState": {fullState:lookingForMore|openForMore|full}
}
```

would result in:

```
200 OK
{
    "id": {circleId},
    "name": {nonempty string},
    "vision": {string},
    "mission": {string},
    "aim": {string},
    "expectationsForMembers": {expectationsForMembers},
    "members": [
        {
            "id": {userId},
            "email": {email},
            "invitationState": {invitationState:invited|member}
        }
    ],
    "contactPerson": {userId},
    "fullState": {fullState:lookingForMore|openForMore|full}
}
```

Note that for members only id OR email should be present.

Note: contact person starts as the creating user.

Todo: I am dissatisfied with the name `fullState`. --- Niels A

Todo: When a circle is created some standard roles are also defined.
(Yet to be specified.)

### update (TODO)

```
PUT /circles/{id}
{
    "name": {nonempty string},
    "vision": {string},
    "mission": {string},
    "aim": {string},
    "expectationsForMembers": {expectationsForMembers},
    "members": [
        {
            "id": {userId},
            "email": {email},
            "invitationState": {invitationState:invited|member}
        }
    ],
    "contactPerson": {userId},
    "fullState": {fullState:lookingForMore|openForMore|full}
}
```

results in

```
200 OK
```

Fields left out (in Javascript, `undefined`) are not updated.
To unset a value, the field must be explicitly set to `null`.

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
            "previousRoleOwners": [
                {
                    "id": {id},
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
Current person is updated once the next term starts.
**OR** maybe we don't need to show the current `person` at all?
It is a derived field (from `elections`).

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
            "title": {string},
            "owner": {userId},
            "why": {string},
            "presentAtDecisionMaking": [ {id}, ... ],
            "missingAtDecisionMaking": [
                {
                    "id": {userId},
                    "state": {state:missing|approved|complained},
                    "complaint": {string}
                }
            ],
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
The members missing are automatically calculated from the members in the circle at the time.
The missing members can later approve of the agreement, or complain (with a written reason), which notifies the facilitator (TODO).

***create (TODO)***

...

***update (TODO)***

...

**Agreements (TODO)**


