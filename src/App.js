import React, { Component } from 'react'
import Chat from './Chat'
import { Notification, Steps, Toggle, List, Stack } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import ArrowRightIcon from '@rsuite/icons/ArrowRight';

const URL = 'ws://localhost:3030'
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: {
        registered: [],
        ready: [],
        pairs: [],
        options: []
      },
      registered: false,
      realName: "",
      assignedName: null,
      step: 0,
      step1ready: false,
      wishes: "На твій россуд, що завгодно."
    }
  }



  ws = new WebSocket(URL)

  onUpdate = (upd) => {
    console.log(upd);
    if (upd.personal !== undefined) {
      if (upd.personal.realName !== undefined) {
        this.setState({ realName: upd.personal.realName })
      }
      if (upd.personal.assignedName !== undefined) {
        this.setState({ assignedName: upd.personal.assignedName })
      }
    } else {
      this.setState({ current: upd });
      if (this.state.current.pairs.length > 0) {
        this.setState({ step: 2 })
      }
    }
  }

  onRegisterClick = (_) => {
    this.setState({ registered: true, step: 1 });
    this.ws.send(JSON.stringify({ command: "register", realName: this.state.realName }));
  }

  onOptionChange = (name, value) => {
    this.ws.send(JSON.stringify({command: "changeopt", option: name, value: value}));
  }

  onRealNameChange = event => {
    var value = event.target.value;
    this.setState({ realName: value });
  }

  onWishesChange = event => {
    var value = event.target.value;
    this.setState({ wishes: value });
  }

  renderStep0 = () => {
    return <div><div className='widget-inside'>
      <p>Як тебе звати насправді, котику?</p>
      <input value={this.state.realName || ""} onChange={this.onRealNameChange}></input>
    </div>
      <button onClick={this.onRegisterClick} disabled={this.state.registered}>Зарееструй мене</button>
    </div>
  }

  renderStep2 = () => {
    var pairs = this.state.current.pairs.map((el, i) => {
      var f = el.f == this.state.assignedName ? <mark>{el.f}</mark> : el.f
      var t = el.t == this.state.assignedName ? <mark>{el.t}</mark> : el.t

      return <List.Item key={i}>
        <p>{f}<ArrowRightIcon></ArrowRightIcon>{t}</p>
      </List.Item>
    })
    return <Stack>
      <div className='widget-inside'>
      <List bordered>
        {pairs}
      </List>
    </div>
      </Stack>
  }

  onReadyStep1Clicked = () => {
    this.setState({ step1ready: true, step: 1 });
    this.ws.send(JSON.stringify({ command: "ready", wishes: this.state.wishes }));
  }

  renderAllReadyStates = () => {
    var registeredRenders = this.state.current.registered.map((el, i) => {
      var isHere = this.state.current.ready.indexOf(el) >= 0;
      return <span key={i}><Toggle className="ready-toggle" checked={isHere} readOnly unCheckedChildren="ще" checkedChildren="вже"></Toggle></span>
    })
    return registeredRenders
  }

  renderStep1 = () => {
    return <div className="big-field">
      <h1>Вітаю!</h1>
      <p>Відтепер я буду звати тебе <b>{this.state.assignedName}</b>.<br />
        Це твоє таємне ім'я, нікому його не кажи. І також це твій ідентифікатор на сервері.</p>
      <p><i>Так, я все ще пам'ятаю, що ти {this.state.realName}.</i> Але це знаю лише я. І сервер.</p><br />
      <p>А тут ти, {this.state.assignedName}, можеш написати свої побажання. Їх побачить лише потрібна людина.</p>
      <textarea disabled={this.state.step1ready} onChange={this.onWishesChange} value={this.state.wishes} className='wishes-text'></textarea>
      <p>Коли всі вже зберуться і ти закінчиш, натисни
        <Toggle className="ready-toggle" disabled={this.state.step1ready} value={this.state.step1ready} unCheckedChildren="Готово" checkedChildren="Зачекай" onChange={() => this.onReadyStep1Clicked()}>
        </Toggle></p>
      <div>
        <p>Інші котики: {this.renderAllReadyStates()}</p>
      </div>
    </div>
  }

  renderContent = (step) => {
    if (step == 0) {
      return this.renderStep0()
    } else
      if (step == 1) {
        return this.renderStep1()
      }
    if (step == 2) {
      return this.renderStep2()
    }
    else {
      return <div>NOOOOOO</div>
    }
  }

  render() {
    return (
      <div className="App">
        <Steps current={this.state.step}>
          <Steps.Item title="Реестрація" />
          <Steps.Item title="Побажання" />
          <Steps.Item title="Розіграш" />
        </Steps>
        <div className='app-window-content'>
          {this.renderContent(this.state.step)}
        </div>
        <Chat ws={this.ws} onUpdate={this.onUpdate} />
      </div>
    )
  }
}

export default App
