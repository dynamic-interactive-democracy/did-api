# did-api

## Endpoints

### Users

The primary user data is kept in AlleOS for now.
These Users-endpoints are used to retrieve and create new user entries in this system, basically *registering that they exist*, rather than creating full profiles.

Creating a user returns an auth token that can be used to act as the user in the system.

#### get (TODO)

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

#### create

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
        }
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
    // TODO
}
```

Note that for members only id OR email should be present.

Note: contact person starts as the creating user.

Todo: I am dissatisfied with the name `fullState`. --- Niels A

### update (TODO)


