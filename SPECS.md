# SPECS

## Future ideas

- Store player stats
- Configure room turn time

## To Sync

- RoomId: string
- RoomHostPlayerIndex: number
- PlayerList: Player[]
- PlayerEliminatedIndexes[]: number[]
- CurrentPlayerIndex: number
- CurrentTurn: number
- CurrentTurnStartTime: Date
- CurrentPlayerHasGuessed: boolean
- CurrentGuess: string
- AlreadyEnteredArtists[]: Artist[]

## Player

- CookieId
- Username
- ws: Websocket

## Artist

- Name
- ImageUrl

# Websocket

### CREATE : Create lobby

Body:

```
CookieId: string
Username: string
RoomId: string
```

- Create player with info
- Store new room with Id
- Set room host player index to 0
- Add Player to PlayerList

Response

```
Success: boolean
RoomId: string
RoomHostPlayerIndex: number
PlayerList: Player[]
```

### JOIN : Join lobby

Body:

```
CookieId: string
Username: string
RoomId: string
```

- Bad request if CurrentTurn != 0
- Add player to the players array

Response

```
Success: boolean
RoomHostPlayerIndex: number
PlayerList: Player[]
```

### LEAVE : Leave lobby

Body:

```
CookieId: string
```

Response:

```
Success: boolean
PlayerList: Player[]
```

### START : Start game

Body:

```
CookieId: string
```

- Check if player is host

Response:

```
CurrentTurn: number
CurrentTurnStartTime: Date
```

### GUESS : Guess artist because it is our turn

Body:

```
CookieId: string
Guess: string
```

Response:

```
CurrentTurn: number
Success: boolean
```

- Check if guess is correct
- If guess is correct, add artist to already entered artists array
  - Next player turn
- If guess is incorrect, add player to eliminated array
  - Check if more than 2 players are still playing
    - If so, switch to next player
    - If not, end game

### GUESSING : Update currentGuess

Body:

```
CookieId: string
CurrentGuess: string
```

Response:

```
CurrentGuess: string
```

# Endpoints

### /api/guess : POST

https://developer.spotify.com/documentation/web-api/reference/#/operations/search
Body:

```
Search: string
```

- Call spotify api to search for an item
- Return first track of the request
  Response:

```
Track: Track
```
