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
            "remoteId": {id},
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
        "remoteId": {id},
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
            "remoteId": {id},
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
                    "id": {remoteId},
                    "email": {email},
                    "invitationState": {invitationState:invited|member}
                },
                ...
            ],
            "contactPerson": {remoteId},
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
            "id": {remoteId},
            "email": {email},
            "invitationState": {invitationState:invited|member}
        }
    ],
    "contactPerson": {remoteId},
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
            "id": {remoteId},
            "email": {email},
            "invitationState": {invitationState:invited|member}
        }
    ],
    "contactPerson": {remoteId},
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
            "id": {id},
            "person": {remoteId},
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
                            "nominator": {remoteId},
                            "nominee": {remoteId},
                            "changeRoundNominee": {remoteId}
                        },
                        ...
                    ],
                    "electee": {remoteId},
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

Todo: Start/finish election

### create (TODO)

Todo: ...

### edit (TODO)

Todo: ...
