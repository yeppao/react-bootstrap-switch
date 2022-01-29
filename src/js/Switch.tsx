import '../less/bootstrap3/build.less';
import React, { createRef, MutableRefObject } from 'react';

type SwitchState = {
  offset: number;
  skipAnimation: boolean;
  dragStart: number | boolean;
  focus: boolean;
  value: boolean | null;
  labelWidth: string | number;
  handleWidth: string | number;
  dragged?: boolean;
}

type SwitchProps = {
  baseClass: string;
  wrapperClass: string;
  bsSize?: string;
  handleWidth: string | number;
  id?: string;
  labelWidth: string | number;
  onColor: string;
  offColor:       string;
  onText:         React.ReactNode;
  offText:        React.ReactNode;
  labelText:      React.ReactNode;
  inverse:        boolean;
  animate:        boolean;
  disabled:       boolean;
  readonly:       boolean;
  tristate:       boolean;
  defaultValue:   boolean;
  value?: boolean;
  onChange?: (sw: Switch, newValue: boolean | null) => {};
};

export default class Switch extends React.Component<SwitchProps, SwitchState> {
  
  static defaultProps: SwitchProps = {
    baseClass:      'bootstrap-switch',
    wrapperClass:   'wrapper',
    bsSize:         undefined,
    handleWidth:    'auto',
    labelWidth:     'auto',
    onColor:        'primary',
    offColor:       'default',
    onText:         'ON',
    offText:        'OFF',
    labelText:      ' ',
    inverse:        false,
    animate:        true,
    disabled:       false,
    readonly:       false,
    tristate:       false,
    defaultValue:   true,
    value:          undefined
  };

  elmOnHandle: MutableRefObject<HTMLSpanElement | null>;
  elmOffHandle: MutableRefObject<HTMLSpanElement | null>;
  elmLabel: MutableRefObject<HTMLDivElement | null>;

  constructor(props: SwitchProps) {
    super(props);

    this.state = {
      offset: 0,
      skipAnimation: true,
      dragStart: 0,
      focus: false,
      value: props.value != undefined ? props.value : props.defaultValue,
      labelWidth: props.labelWidth,
      handleWidth: props.handleWidth
    };

    this.elmOnHandle = createRef<HTMLSpanElement>();
    this.elmOffHandle = createRef<HTMLSpanElement>();
    this.elmLabel = createRef<HTMLDivElement>();
  }

  componentDidMount() {
    this._recalculateWidth();
  }

  componentDidUpdate(nextProps: SwitchProps) {
    const newValue = nextProps.value !== undefined ? nextProps.value : this.state.value;
    const oldValue = this.state.value;

    if (nextProps !== this.props) {
      // ensure width is updated
      this.setState({
        labelWidth: this.props.labelWidth,
        handleWidth: this.props.handleWidth,
        value: newValue
      }, () => {
        this._recalculateWidth(newValue == oldValue);
      });
    }    
  }

  _getValue() {
    if(this.props.value !== undefined)
      return this.props.value;

    return this.state.value;
  }

  value(val: string) {
    if(val === undefined)
      return this.state.value;

    const newVal = val === null ? null : !!val
    this._setValue(newVal);
    return newVal;
  }

  _wrapperClasses() {
    const {
      baseClass,
      wrapperClass,
      bsSize,
      disabled,
      readonly,
      inverse,
      tristate,
      animate,
      id
    } = this.props;

    const {
      skipAnimation,
      focus,
      dragStart,
    } = this.state;

    const value = this._getValue();

    const classes = [ baseClass, wrapperClass ];
    classes.push(baseClass + (value ? "-on" : "-off"));

    if (bsSize) classes.push(baseClass + "-" + bsSize);
    if (disabled) classes.push(baseClass + "-disabled");
    if (readonly) classes.push(baseClass + "-readonly");
    if (value === null) classes.push(baseClass + "-indeterminate");
    if (inverse) classes.push(baseClass + "-inverse");
    if (tristate) classes.push(baseClass + "-tristate");
    if (id) classes.push(baseClass + "-" + id);
    if (animate && !dragStart && !skipAnimation) classes.push(baseClass + "-animate");
    if (focus) classes.push(baseClass + "-focused");

    return classes.join(" ");
  }

  _recalculateWidth(animate?: null | boolean) {
    const onHandle = this.elmOnHandle.current;
    const offHandle = this.elmOffHandle.current;
    const label = this.elmLabel.current;

    if (!onHandle?.offsetWidth || !offHandle?.offsetWidth) return;
    

    // assuming that if the elms need to be resized, the size will be cleared elsewhere first
    const { handleWidth, labelWidth } = this.props;
    const newHandleWidth = handleWidth == "auto"
      ? Math.max(onHandle?.offsetWidth, offHandle?.offsetWidth)
      : handleWidth;

    if (!label?.offsetWidth) return;

    const newLabelWidth = labelWidth == "auto"
      ? Math.max(+newHandleWidth, label?.offsetWidth)
      : labelWidth;

    return this.setState({
      handleWidth: newHandleWidth,
      labelWidth: newLabelWidth
    }, () => {
      this._updateContainerPosition(!animate);
    });
  }

  _updateContainerPosition(noAnimate?: boolean) {
    const { handleWidth, offset } = this.state;
    const { inverse } = this.props;
    const value = this._getValue();

    // skip animating if no offset yet
    const skipAnimation = noAnimate || (offset == null)

    let newOffset = offset;

    if(handleWidth === 'auto') {
      newOffset = 0;
    } else if (value === null) {
      newOffset = -(+handleWidth / 2);
    } else if (value) {
      newOffset = inverse ? -handleWidth : 0;
    } else { 
      newOffset = inverse ? 0 : -handleWidth;
    }

    return this.setState({
      skipAnimation: skipAnimation,
      offset: newOffset
    }, );
  }

  _disableUserInput() {
    const { disabled, readonly } = this.props;

    return disabled || readonly;
  }

  _handleOnClick(){
    if(this._disableUserInput())
      return;

    this._setValue(this.props.tristate?(this._getValue()==null):false);
    this._setFocus();
  }

  _handleOffClick(){
    if(this._disableUserInput())
      return;

    this._setValue(this.props.tristate?(this._getValue()!=null):true);
    this._setFocus();
  }

  _handleKeyPress(e: React.KeyboardEvent){
    if (!e.key || this._disableUserInput())
      return;

    const { inverse } = this.props;

    switch (e.key) {
      case 'ArrowLeft':
        return this._setValue(inverse);

      case 'ArrowRight':
        return this._setValue(!inverse);
    }
  }

  _handleLabelMouseDown(pageX: number) {
    if(this.state.dragStart || this._disableUserInput())
      return;

    this.setState({
      dragStart: pageX - this.state.offset
    });
    this._setFocus();
  }

  _handleLabelMouseMove(pageX: number) {
    const { dragStart, handleWidth } = this.state;
    
    if (
      dragStart === undefined || 
      dragStart === null || 
      dragStart === false
    ) return;

    const difference = pageX - (+dragStart);
    if(difference < -handleWidth || difference > 0)
      return;

    this.setState({
      skipAnimation: false,
      offset: difference,
      dragged: true
    }); 
  }

  _handleLabelTouchEnd() {
    const { dragStart, dragged, offset, handleWidth } = this.state;
    
    if  (dragStart === undefined || dragStart === null || dragStart === false)
      return;

    // If the touch ended without motion, then either a mousedown event should fire, or it was a long press and should do nothing
    if (!dragged || dragged === undefined || dragged === null) {
      this.setState({
        dragStart: false,
        dragged: false,
      });
      return
    }

    const { inverse } = this.props;
    
    let val = offset > -(+handleWidth / 2);
    val = inverse ? !val : val;

    this.setState({
      dragStart: false,
      dragged: false,
      value: val
    }, () => {
      this._updateContainerPosition();
      this._fireStateChange(val);
    });
  }

  _handleLabelMouseUp() {
    const { dragStart, dragged, offset, handleWidth } = this.state;
    const value = this._getValue();
    
    if (dragStart === undefined || dragStart === null || dragStart === false)
      return;

    const { inverse, tristate } = this.props;

    let val: null | boolean;
    
    if (dragged) {
      val = offset > -(+handleWidth / 2);
      val = inverse ? !val : val;
    } else if (tristate) {
      val = value === null ? true : null;
    } else {
      val = !value;
    }

    this.setState({
      dragStart: false,
      dragged: false,
      value: val
    }, () => {
      this._updateContainerPosition();
      this._fireStateChange(val);
    });
  }

  _setFocus() {
    this.setState({
      focus: true
    });
  }

  _setBlur() {
    this.setState({
      focus: false
    });
  }

  _setValue(val: boolean | null){
    const value = this._getValue();
    if(val === value)
      return;

    const newValue = (val === undefined ? !value : val);

    this.setState({
      value: newValue
    }, () => {
      this._updateContainerPosition();
      this._fireStateChange(newValue);
    });
  }

  _fireStateChange(newValue: boolean | null) {
    const { onChange } = this.props;
    if (typeof onChange != "function")
      return;

    setTimeout(() => onChange(this, newValue), 0);
  }

  render() {
    const { baseClass, inverse } = this.props;
    const { handleWidth, labelWidth, offset } = this.state;
  
    const onHandle = this._renderOnHandle();
    const offHandle = this._renderOffHandle();

    let containerWidth: number | string = +labelWidth + (+handleWidth * 2);
    let wrapperWidth: number | string = +labelWidth + +handleWidth;
    if (containerWidth == wrapperWidth || handleWidth == "auto" || labelWidth == "auto")
      containerWidth = wrapperWidth = "auto";

    const containerParams = {
      className: `${baseClass}-container`,
      style: { width: containerWidth, marginLeft: offset }
    };

    return (
      <div
        className={this._wrapperClasses()}
        style={{ width: wrapperWidth }}
        tabIndex={0}
        onKeyDown={this._handleKeyPress.bind(this)}
        onFocus={this._setFocus.bind(this)}
        onBlur={this._setBlur.bind(this)}
      >
        <div {...containerParams}>
          { inverse ? offHandle : onHandle}
          { this._renderLabel() }
          { inverse ? onHandle : offHandle}
        </div>
      </div>
    );
  }

  _renderOnHandle(){
    const { baseClass, onColor, onText } = this.props;
    const { handleWidth } = this.state;

    return (
      <span
        ref={this.elmOnHandle}
        style={{ width: handleWidth }}
        className={`${baseClass}-handle-on ${baseClass}-${onColor}`}
        onClick={this._handleOnClick.bind(this)}
      >
        { onText }
      </span>
    );
  }

  _renderOffHandle() {
    const { baseClass, offColor, offText } = this.props;
    const { handleWidth } = this.state;

    return (
      <span
        ref={this.elmOffHandle}
        style={{ width: handleWidth }}
        className={`${baseClass}-handle-off ${baseClass}-${offColor}`}
        onClick={this._handleOffClick.bind(this)}
      >
        { offText }
      </span>
    );
  }

  _renderLabel(){
    const { baseClass, labelText } = this.props;
    const { labelWidth } = this.state;

    return (
      <span
        ref={this.elmLabel}
        style={{ width: labelWidth }}
        className={`${baseClass}-label`}
        onTouchStart={(e) => this._handleLabelMouseDown.bind(this)(e.touches[0].pageX)}
        onTouchMove={(e) => this._handleLabelMouseMove.bind(this)(e.touches[0].pageX)}
        onTouchEnd={this._handleLabelTouchEnd.bind(this)}
        onMouseDown={(e) => this._handleLabelMouseDown.bind(this)(e.pageX)}
        onMouseMove={(e) => this._handleLabelMouseMove.bind(this)(e.pageX)}
        onMouseUp={this._handleLabelMouseUp.bind(this)}
        onMouseLeave={this._handleLabelMouseUp.bind(this)}
      >
      {labelText}
    </span>
    );
  }
}
