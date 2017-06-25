# did-api

## Endpoints

### Users

#### create
**Currently, everyone can do this.***

Creating single user:

```
POST /users
{
    id: {id},
    name: {name}
}
```

Will return:

```
200 OK
{
    "status": "User created",
    "user": {
        token: {64 char token},
        id: {id},
        name: {name}
    }
}
```


Creating multiple users:
```
POST /users
[
    {
        id: {id},
        name: {name}
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
            token: {64 char token},
            id: {id},
            name: {name}
        },
        ...
    ]
}
```

#### get
To retrieve information about the authenticated user:

```
GET /user
Authorization: Basic `base64(id:token)`
```

Will return:
```
{
    id: {id},
    name: {name}
}
```
