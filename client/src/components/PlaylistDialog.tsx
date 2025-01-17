import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Fab from '@mui/material/Fab'
import Game from '../scenes/Game'
import phaserGame from '../PhaserGame'
import { useAppSelector, useAppDispatch } from '../hooks'
import { openPlaylistDialog, closePlaylistDialog, setFocused } from '../stores/PlaylistStore'
import axios from 'axios'
import store from '../stores'
import { addItemToPlaylist } from '../stores/PlaylistStore'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 50vh;
  background: transparent;
  overflow: hidden;
  max-width: 400px;
  padding: 16px 16px 16px 16px;
`
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #eee;
  border-radius: 16px;
  padding: 0;
  color: #eee;
  display: flex;
  flex-direction: column;

  .close {
    margin: 0 0 0 auto;
    padding: 0;
  }
`

const PlaylistWrapper = styled.div`
  flex: 1;
  border-radius: 0px;
  border-top: 1px solid #aaa;
  overflow-y: auto;
  padding: 5px 5px;
  width: 100%;
  height: 100%;
`

const FabWrapper = styled.div`
  button {
    font-size: 14px;
    color: #666;
    text-transform: lowercase !important;
    line-height: 100%;
    background-color: white !important;
  }

`
export default function PlaylistDialog() {
  const showPlaylistDialog = useAppSelector((state) => state.playlist.playlistDialogOpen)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  const handlePlay = () => {
    console.log('handlePlay')
    game.network.syncMusicStream()
  }

  return (
    <Backdrop>
    {showPlaylistDialog ? (
      <Wrapper>
          <>
            <div style={{display: 'flex', alignItems: 'center', padding: '2px 5px'}}>
              <h3 style={{margin: '5px 0', flexGrow: 1, textAlign: 'center', color: '#888', fontSize: '16px'}}>My Playlist</h3>
              <IconButton
                aria-label="close dialog"
                className="close"
                onClick={() => dispatch(closePlaylistDialog())}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <PlaylistWrapper>
              <MusicSearch />
            </PlaylistWrapper>
          </>)
      </Wrapper>)
      :
        (
          <div style={{textAlign: 'right'}}>
          <FabWrapper>
            <Fab
              color="secondary"
              aria-label="showPlaylistDialog"
              onClick={() => {
                dispatch(openPlaylistDialog())
                dispatch(setFocused(true))
              }}
            >
              My Playlist
            </Fab>
          </FabWrapper>
          </div>
        )
      }
    </Backdrop>
  )
}

const InputWrapper = styled.form`
  border: 1px solid #42eacb;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
`

const InputTextField = styled(InputBase)`
  border-radius: 10px;
  input {
    padding: 5px;
    color: #222;
  }
`

const SearchList =styled.ul`
  padding:0px;
  margin:0px;
`

const MusicSearch = () => {
  const [data, setData] = useState([])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const focused = useAppSelector((state) => state.playlist.focused)
  const game = phaserGame.scene.keys.game as Game

  useEffect(() => {
     axios.get(`http://localhost:2567/youtube/${inputValue}`).then((response) => {
      
      setData(response?.data?.items)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus()
    }
  }, [focused])

  console.log('data', data);

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    inputRef.current?.blur()
    setInputValue('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("/////////////handleKeyDown")
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      dispatch(closePlaylistDialog())
    }
  }

  const handleClick = (title: string, id: string, lengthText: string) => {
    const durationParts = lengthText.split(":")
    let duration = 0;
    
    if (durationParts.length === 3) {
      duration = Number(durationParts[0]) * 60 * 60 + Number(durationParts[1]) * 60 + Number(durationParts[2])
    }

    if (durationParts.length === 2) {
      duration = Number(durationParts[0]) * 60 + Number(durationParts[1]) * 60
    }
    console.log("////////////////////////duration", duration)

    // store.dispatch(addItemToPlaylist(item))
    const item: any = {
      title,
      link: id,
      duration
    }
    game.network.addPlaylistItem(item);
  }

  const resultsList = data?.length > 0 && data?.map( result => {
      const { title, thumbnail, length, id} = result;
      return (
          <YoutubeResult onClick={handleClick} key={id} title={title} thumbnail={thumbnail} length={length} id={id} />
      )
  })

  return (
      <section>
    <InputWrapper onSubmit={handleSubmit}>
      <InputTextField
        inputRef={inputRef}
        autoFocus={focused}
        fullWidth
        placeholder="Search"
        value={inputValue}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={() => {
          if (!focused) dispatch(setFocused(true))
        }}
        onBlur={() => dispatch(setFocused(false))}
      />
    </InputWrapper>

    <SearchList>

    {resultsList}

    </SearchList>

    </section>
  )
}


const ListItem = styled.li`
  border-radius: 0px;
  padding: 10px;
  display: flex;
  color: #666;
  flex-direction: row;
  border-bottom:1px solid grey;
  justify-content: space-between;

  h4 {
      color: #666;
  }
`

const YoutubeResult = ({id, thumbnail, title, length, onClick}) => {

    const lengthText = length?.simpleText;

    return(
        <ListItem onClick={() => onClick(title, id, lengthText)}>
            <section>
                <h4>{title}</h4>
            </section>
            <section>
                {lengthText}
            </section>
        </ListItem>

    );
}
