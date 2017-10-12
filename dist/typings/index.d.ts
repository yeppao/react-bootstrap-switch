import * as React from 'react';

export interface SwitchPropTypes {
	baseClass?:      string;
	wrapperClass?:   string;
	bsSize?:         string;

	handleWidth?:    (string | number);
	labelWidth?:     (string | number);

	onColor?:        string;
	offColor?:       string;

	onText?:         any; // PropTypes.node?,
	offText?:        any;
	labelText?:      string;

	inverse?:        boolean;
	animate?:        boolean;

	disabled?:       boolean;
	readonly?:       boolean;

	tristate?:       boolean;
	defaultValue?:   boolean;
	value?:          boolean;
	onChange:       (component: any, enabled: boolean) => void
}

export default class Switch extends React.Component<SwitchPropTypes, {}> {
    constructor(props: SwitchPropTypes);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}