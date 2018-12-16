import React, { Component, Fragment } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import classNames from "classnames";
import MainCtaBase from "../../Shared/Components/MainCta";
import { OutsideHandler } from "../Components/Helpers";

class EditableText extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editing: false,
			wasEdited: false
		};
		this.toggleEdit = this.toggleEdit.bind(this);
		this.disableEditing = this.disableEditing.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.onInputChange = this.onInputChange.bind(this);
		this.inputElement = React.createRef();
	}

	toggleEdit() {
		this.setState(
			{
				editing: !this.state.editing
			},
			() => this.state.editing && this.inputElement.current.focus()
		);
	}

	onInputChange() {
		this.setState({
			wasEdited:
				this.inputElement.current.defaultValue !==
				this.inputElement.current.value
		});
	}

	disableEditing() {
		this.setState({
			editing: false
		});
	}

	handleClick() {
		const { onSubmit } = this.props;
		onSubmit(this.inputElement.current.name, this.inputElement.current.value);
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			prevProps.isLoading !== this.props.isLoading &&
			this.props.isLoading === false
		) {
			this.setState({ ...this.state, wasEdited: false });
		}
	}

	render() {
		const { value, type, label, name, isLoading } = this.props;
		const { editing, wasEdited } = this.state;
		return (
			<Group>
				<OutsideHandler handleClickOutside={this.disableEditing}>
					<Fragment>
						<GroupLabel className={classNames({ active: editing })}>
							{label}
						</GroupLabel>
						<GroupInner>
							{editing ? (
								<GroupInput
									ref={this.inputElement}
									defaultValue={value}
									onChange={this.onInputChange}
									type={type}
									name={name}
								/>
							) : (
								<GroupData onClick={this.toggleEdit}>{value}</GroupData>
							)}
							{editing && wasEdited && (
								<MainCta
									text="shrani"
									handleClick={this.handleClick}
									fontSize={10}
									isLoading={isLoading}
								/>
							)}
						</GroupInner>
					</Fragment>
				</OutsideHandler>
			</Group>
		);
	}
}

EditableText.propTypes = {
	onSubmit: PropTypes.func.isRequired,
	value: PropTypes.string,
	type: PropTypes.oneOf(["email", "text", "password"]),
	label: PropTypes.string,
	isLoading: PropTypes.bool,
	name: PropTypes.string.isRequired
};

EditableText.defaultProps = {
	type: "text"
};

const Group = styled.div`
	margin: 15px 0;
`;

const GroupInner = styled.div`
	display: flex;
	justify-content: space-between;
`;

const GroupLabel = styled.p`
	text-transform: uppercase;
	font-size 10px;
  font-weight: 900;
  &.active {
    color: ${props => props.theme.mainColor}
  }
`;

const GroupData = styled.p`
	font-size: 18px;
	&:hover {
		cursor: pointer;
	}
`;

const GroupInput = styled.input`
	font-size: 18px;
	border: none;
	outline: none;
	border-bottom: 2px solid ${props => props.theme.mainColor};
`;

const MainCta = styled(MainCtaBase)`
	min-width: 65px;
	margin: 0;
`;

export default EditableText;
