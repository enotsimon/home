import React from 'react'
import TextEntry from './text_entry'
import StButton from './st_button'
import {SimplePanelSuccess} from 'common/components/panel'

import type {action_dialog_phrase, id_dialog_cell} from './types/dialog_types'

type DialogProps = {
  player_sentences: Array<action_dialog_phrase>,
  on_player_sentence_click: (id_cell: id_dialog_cell) => void,
  phrases: Array<action_dialog_phrase>,
}

export default function Dialog(props: DialogProps) {
  return (
    <SimplePanelSuccess title="dialog">

      {props.phrases.map(phrase =>
        <div key={phrase.id}>
          <span><TextEntry>{phrase.owner}</TextEntry>:&nbsp;</span>
          <TextEntry>{phrase.phrases}</TextEntry>
        </div>
      )}

      {/* TODO add player name so we can understand who's speaking */}
      {props.player_sentences.map(sentence => {
        return (
          <StButton key={sentence.id} on_click={() => props.on_player_sentence_click(sentence.id)}>
            <TextEntry>
              {sentence.phrases}
            </TextEntry>
          </StButton>
        );
      })}
      
    </SimplePanelSuccess>
  )
}
