# /api/start (GET)

Headers:
```json
{
    'Authorization': <'token'>
}
```

Response : (random artist from Fresh Rap playlist)
```json
{
    "name": "Fresh",
    "artistImage": "https://i.scdn.co/image/ab6761610000e5eb39419a277b4cf6b0495b9534"
}
```

# /api/guess (POST)

Headers:
```json
{
    'Authorization': <'token'>
}
```
Body:
```json
{
    "guess": "La fève,Zamdane"
}
```

Response : (random artist from Fresh Rap playlist)
```json
{
    "name": "VOIR AILLEURS (feat. Zamdane)",
    "trackImage": "https://i.scdn.co/image/ab67616d0000b273c3142e16d4fe11a5906d79a1",
    "releaseDate": "2021-12-17",
    "previewUrl": "https://p.scdn.co/mp3-preview/cc42743982280c6182760611708e6ae0feb66a3a?cid=baa17fe76fa24e4c9e77cdc7d94f22f4",
    "artistImage": "https://i.scdn.co/image/ab6761610000e5eb2043c34f3bc959fb85068919"
}
```

# /api/token (GET)

Reponse: 
```json
{
    "token": "BQAyYH6XzvxbewISlbOwoiU28jlmlS165b9xM9RUPYUZTdyPFNM3Mzuv3zxTF3QjcjX7P2sQ2WhePyy5woatvihFlc8OZBOboNpnOzT3A4v5h7l29FQ"
}
```