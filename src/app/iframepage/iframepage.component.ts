import { Component, ViewChild } from '@angular/core';
import { MoveChange, NgxChessBoardView } from 'ngx-chess-board';

@Component({
  selector: 'app-iframepage',
  templateUrl: './iframepage.component.html',
  styleUrls: ['./iframepage.component.css']
})
export class IframepageComponent {
  // Used for interacting with board
  @ViewChild('board', { static: false })
  board: NgxChessBoardView | undefined;
  // Pieces color
  color: string | undefined
  // Disable other color on this board
  lightDisabled: boolean = false;
  darkDisabled: boolean = false;
  // Stores most recent move
  lastMove: string = "";

  constructor() {
    this.color = window.frameElement?.id;

    // Disable the other color
    if (this.color == "dark") {
      this.lightDisabled = true;
    } else {
      this.darkDisabled = true;
    }

    // Listens to events sent from parent component
    window.addEventListener(
      "message", this.moveInput.bind(this)
    );
  }

  /**
   * Sets up both boards
   */
  ngAfterViewInit(): void {
    // Retrieve saved game from local storage
    let savedFen = window.localStorage.getItem(`fen-${this.color}`);
    if (savedFen != null) {
      this.board?.setFEN(savedFen);

      // Reverses the second board to face the player
      if (this.color == "dark") {
        this.board?.reverse();
      }

      // Disable board if it is not this color's turn
      let enabled = window.localStorage.getItem(`enabled-${this.color}`) == "true";
      if (!enabled) {
        this.disable();
      }
    } else {
      // Default setup if no saved game: reverse and disable dark color
      if (this.color == "dark") {
        this.board?.reverse();
        this.disable();
      }
    }
  }

  /**
   * Listens to moves that were performed
   *
   * @param move - move that was performed
   */
  moveOutput(move: MoveChange): void {
    // Ignore duplicate move since board.move also causes this to be fired
    if ((<any>move).move == this.lastMove) {
      return;
    }

    // Disable this board and send move to parent component  
    this.disable();
    window.parent.postMessage({ type: "output", color: this.color, move: move });
  }

  /**
   * Handles events from parent component
   *
   * @param event - event recieved from parent component
   */
  moveInput(event: MessageEvent<any>): void {
    let data = event.data;
    // If the colors don't match, then it came from the other color board
    if (data.type == "input" && data.color != this.color) {
      // Stores the last move to prevent moveOutput from called twice for same move
      this.lastMove = data.move.move;

      // Move the piece and enable this board
      this.board?.move(data.move.move)
      this.enable();
    } else if (data.type == "checkmate") {
      // Disable board on checkmate
      this.disable();
    } else if (data.type == "reset") {
      // Reset board when new game button pressed
      this.board?.reset();

      // Reverse and disable dark board and enable light board
      if (this.color == "dark") {
        this.board?.reverse();
        this.disable();
      } else {
        this.enable();
      }
    } else if (data.type == "save") {
      // Save location of pieces
      let fen = this.board?.getFEN() || "";
      window.localStorage.setItem(`fen-${this.color}`, fen);

      // Save whether the board is enabled or disabled
      let iframe = <HTMLElement>window.frameElement;
      window.localStorage.setItem(`enabled-${this.color}`, `${iframe.style.pointerEvents != "none"}`);
    }
  }

  /**
   * Enable this board
   */
  enable(): void {
    let iframe = <HTMLElement>window.frameElement;
    iframe.style.removeProperty("pointer-events");
  }

  /**
   * Disable this board 
   */
  disable(): void {
    let iframe = <HTMLElement>window.frameElement;
    iframe.style.pointerEvents = "none";
  }
}
