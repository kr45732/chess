import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})
export class MainpageComponent {
  srcUrl: string = "iframepage";
  srcUrlSafe: SafeResourceUrl | undefined;

  constructor(public sanitizer: DomSanitizer) {
    // Listen for move events from iframes 
    window.addEventListener(
      "message", this.moveRecieved.bind(this)
    );

    // Tell children to save game before the tab is reloaded or closed
    window.onbeforeunload = () => {
      this.postMessageToChildren({ type: "save" })
      return null;
    };
  }

  /**
   * Sanitizes the iframe url
   */
  ngOnInit(): void {
    this.srcUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.srcUrl);
  }

  /**
   * Handles communication to and from both game boards
   *
   * @param event - incomming message event from a child iframe
   */
  moveRecieved(event: MessageEvent<any>): void {
    let data = event.data;
    if (data.type == "output") {
      // Duplicate current move in other iframe 
      this.postMessageToChildren({ type: "input", color: data.color, move: data.move });

      // Send alert if checkmate and disable both game boards
      if (data.move.checkmate) {
        window.alert(`Checkmate: ${data.color} wins!`)
        this.postMessageToChildren({ type: "checkmate" });
      }
    }
  }

  /**
   * Resets both game boards
   */
  reset(): void {
    this.postMessageToChildren({ type: "reset" });
  }

  /**
   * Posts a message to child iframes
   *
   * @param message - message to be send to child iframes
   */
  postMessageToChildren(message: any): void {
    let iframes = document.getElementsByTagName("iframe");
    for (let i = 0; i < iframes.length; i++) {
      iframes[i].contentWindow?.postMessage(message);
    }
  }
}
