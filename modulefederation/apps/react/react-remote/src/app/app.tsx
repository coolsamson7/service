// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ReactDOM from 'react-dom';
import styles from './app.module.css';

import NxWelcome from './nx-welcome';

export function App() {
  return (
    <div>
      <NxWelcome title="react-remote" />
    </div>
  );
}

class Mfe4Element extends HTMLElement {
  connectedCallback() {
    ReactDOM.render(<App/>, this);
  }
}

customElements.define('react-element', Mfe4Element);

export default App;
