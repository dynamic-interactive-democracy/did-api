# did-api

## Endpoints

### Users

#### create
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
        remoteId: {id},
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
            remoteId: {id},
            name: {name}
        },
        ...
    ]
}
```
