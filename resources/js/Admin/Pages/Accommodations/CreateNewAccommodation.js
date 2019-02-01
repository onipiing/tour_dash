import React, { Component } from "react";
import { connect } from "react-redux";
import produce from "immer";
import styled from "styled-components";
import PropTypes from "prop-types";
import _findIndex from "lodash/findIndex";
import _isEqual from "lodash/isEqual";
import _omit from "lodash/omit";
import {
	PageWrapper,
	Sidebar as SidebarBase,
	MainArea,
	SidebarGroup,
	SidebarGroupItem
} from "../../Components/Layout";
import Switch from "../../Components/Switch";
import ImageInput from "../../Components/Editor/ImageInput";
import SidebarEditorCta from "../../Components/Editor/SidebarEditorCta";
import { SectionTitle } from "../../Components/Typography";
import { Columns, Column } from "bloomer";
import InputField from "../../Components/InputField";
import Textarea from "../../Components/Textarea";
import Dropdown from "../../Components/Dropdown";
import amenetiesMap from "../../Utils/amenetiesMap";
import IconCard from "../../Components/IconCard";
import SortableImages from "../../Components/SortableImages";
import UploadImageBtn from "../../Components/UploadImageBtn";

const initialState = {
	title: "",
	accommodationUpdated: false,
	featuredImage: null,
	featuredImagePreview: "",
	loadingGalleryImage: false,
	imageLoading: false,
	bestSeller: false,
	trending: false,
	visible: true,
	description: "",
	price: 0,
	num_of_guests: 0,
	num_of_beds: 0,
	type: "soba",
	features: [],
	gallery: [],
	content: ""
};

class CreateNewAccommodation extends Component {
	constructor(props) {
		super(props);
		this.state = { ...initialState };
		this.clearFeaturedImage = this.clearFeaturedImage.bind(this);
		this.uploadFeaturedImage = this.uploadFeaturedImage.bind(this);
		this.toggleInputField = this.toggleInputField.bind(this);
		this.handleInputField = this.handleInputField.bind(this);
		this.handleDropdownChange = this.handleDropdownChange.bind(this);
		this.reorderImages = this.reorderImages.bind(this);
		this.uploadGalleryImage = this.uploadGalleryImage.bind(this);
		this.getDiff = this.getDiff.bind(this);
		this.saveAccommodation = this.saveAccommodation.bind(this);
	}

	clearFeaturedImage() {
		this.setState({ featuredImage: null, featuredImagePreview: "" });
	}

	uploadFeaturedImage(e) {
		this.setState({
			...this.state,
			imageLoading: true,
			featuredImagePreview: e.target.files[0]
				? URL.createObjectURL(e.target.files[0])
				: ""
		});

		const formData = new FormData();
		formData.append("image", e.target.files[0]);

		axios
			.post("/api/image/add-new", formData)
			.then(res => {
				const { data } = res.data;
				this.setState({
					...this.state,
					imageLoading: false,
					featuredImagePreview: data.medium,
					featuredImage: data
				});
			})
			.catch(err => console.log(err));
	}

	uploadGalleryImage(e) {
		this.setState({
			...this.state,
			loadingGalleryImage: true
		});

		const formData = new FormData();
		formData.append("image", e.target.files[0]);

		axios
			.post("/api/image/add-new", formData)
			.then(res => {
				const { data } = res.data;
				this.setState({
					...this.state,
					loadingGalleryImage: false,
					gallery: [
						...this.state.gallery,
						{
							src: data.thumbnail,
							allsizes: data,
							width: 1,
							height: 1,
							hidden: false
						}
					]
				});
			})
			.catch(err => console.log(err));
	}

	toggleInputField(e) {
		const { name, checked } = e.target;
		this.setState({
			[name]: checked
		});
	}

	handleInputField(e) {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	}

	handleDropdownChange(value) {
		this.setState({
			type: value
		});
	}

	setFeature({ id, name, icon }) {
		const { features } = this.state;
		const index = _findIndex(features, { id: id });
		if (index > -1) {
			this.setState({
				...this.state,
				features: features.filter(feature => feature.id !== id)
			});
		} else {
			this.setState({
				...this.state,
				features: [...this.state.features, { id, name, icon }]
			});
		}
	}

	reorderImages(images) {
		this.setState({
			...this.state,
			gallery: images
		});
	}

	getDiff() {
		return _isEqual(this.state, initialState);
	}

	saveAccommodation() {
		const preparedState = produce(this.state, draft => {
			draft.gallery = draft.gallery.map(item => {
				if (!item.hidden) {
					const cleanedItem = _omit(item, ["width", "height", "src", "hidden"]);
					return cleanedItem.allsizes;
				}
			});
		});
		console.log(
			_omit(preparedState, [
				"accommodationUpdated",
				"imageLoading",
				"featuredImagePreview",
				"loadingGalleryImage"
			])
		);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.match.params.id && !this.props.match.params.id) {
			// Changed from editing page to creating a new one
			this.props.setOriginalState();
			this.setState({ ...initialState });
		}
		if (!prevProps.match.params.id && this.props.match.params.id) {
			// Changed from adding a new page to editing exsiting one
			this.fetchExistingPage();
		}
		const isEqual = this.getDiff();
		if (!isEqual && !this.state.accommodationUpdated) {
			this.setState({
				accommodationUpdated: true
			});
		}
	}

	render() {
		const {
			accommodationUpdated,
			imageLoading,
			featuredImagePreview,
			bestSeller,
			trending,
			visible,
			title,
			price,
			description,
			num_of_beds,
			num_of_guests,
			type,
			features,
			gallery,
			loadingGalleryImage,
			content
		} = this.state;
		return (
			<PageWrapper pageTitle="Dodaj novo namestitev">
				<MainArea>
					<section className="section">
						<SectionTitle text="Specifikacije" />
						<Columns>
							<Column>
								<InputField
									label="Naziv namestitve"
									value={title}
									onChange={this.handleInputField}
									name="title"
								/>
								<Columns>
									<Column>
										<InputField
											label="Cena na noč"
											placeholder="0"
											value={price > 0 ? price : ""}
											onChange={this.handleInputField}
											name="price"
											type="number"
										/>
									</Column>
									<Column>
										<InputField
											label="Število postelj"
											value={num_of_beds > 0 ? num_of_beds : ""}
											placeholder="0"
											onChange={this.handleInputField}
											name="num_of_beds"
											type="number"
										/>
									</Column>
								</Columns>
								<Columns>
									<Column>
										<InputField
											label="Število oseb"
											placeholder="0"
											value={num_of_guests > 0 ? num_of_guests : ""}
											onChange={this.handleInputField}
											name="num_of_guests"
											type="number"
										/>
									</Column>
									<Column>
										<Dropdown
											condensed
											fullWidth
											mimicInputField
											label="Tip namestitve"
											possibilities={["soba", "apartma", "bungalov"]}
											current={type}
											color="dark"
											handleClick={this.handleDropdownChange}
										/>
									</Column>
								</Columns>
							</Column>
							<Column>
								<Textarea
									placeholder="Dvoposteljna soba, idealna za..."
									label="Kratek opis namestitve"
									value={description}
									onChange={this.handleInputField}
									name="description"
									rows={8}
								/>
							</Column>
						</Columns>
					</section>
					<section className="section">
						<SectionTitle
							text={`Dodane vrednosti namestitve (${features.length})`}
						/>
						<br />
						<Columns isMultiline>
							{amenetiesMap.map(amenety => (
								<Column isSize="1/4" key={amenety.id}>
									<IconCard
										active={_findIndex(features, { id: amenety.id }) > -1}
										onClick={this.setFeature.bind(this, {
											id: amenety.id,
											name: amenety.name,
											icon: amenety.icon
										})}
										icon={amenety.icon}
										name={amenety.name}
									/>
								</Column>
							))}
						</Columns>
					</section>
					<section className="section" style={{ position: "relative" }}>
						<SectionTitle text={`Galerija namestitve (${gallery.length})`} />
						{gallery.length > 0 ? (
							<SortableImages
								images={gallery}
								reorderImages={this.reorderImages}
							/>
						) : (
							<NoImagesContainer>
								<img src="/images/camera.svg" alt="Galerija nastanitve" />
								<p>Dodajte slike v galerijo</p>
							</NoImagesContainer>
						)}
						<AbsoluteCtaContainer>
							<UploadImageBtn
								onChange={this.uploadGalleryImage}
								text="dodaj fotografijo"
								loading={loadingGalleryImage}
							/>
						</AbsoluteCtaContainer>
					</section>
					<section className="section">
						<SectionTitle text="Podroben opis namestive" />
						<Textarea
							placeholder="Poleg vseh ugodnosti je ta namestitev idealna tudi za..."
							value={content}
							onChange={this.handleInputField}
							name="content"
							rows={8}
						/>
					</section>
				</MainArea>
				<Sidebar>
					<SidebarGroup heading="Glavna slika namestitve">
						<ImageInput
							onChange={this.uploadFeaturedImage}
							clearImage={this.clearFeaturedImage}
							selectedImagePreview={featuredImagePreview}
							loading={imageLoading}
							containerHeight={250}
						/>
					</SidebarGroup>
					<SidebarGroup heading="Splošne lastnosti">
						<SidebarGroupItem heading="Najbolje prodajana namestitev?">
							<Switch
								checked={bestSeller}
								handleChange={this.toggleInputField}
								name="bestSeller"
							/>
						</SidebarGroupItem>
						<SidebarGroupItem heading="Trenutno zelo iskano?">
							<Switch
								checked={trending}
								handleChange={this.toggleInputField}
								name="trending"
							/>
						</SidebarGroupItem>
					</SidebarGroup>
					<SidebarGroup heading="Status namestitve" noBorder>
						<SidebarGroupItem heading="Namestitev je objavljena?">
							<Switch
								checked={visible}
								handleChange={this.toggleInputField}
								name="visible"
							/>
						</SidebarGroupItem>
					</SidebarGroup>
					<SidebarEditorCta
						onClick={this.saveAccommodation}
						text="SHRANI NAMESTITEV"
						disabled={!accommodationUpdated}
					/>
				</Sidebar>
			</PageWrapper>
		);
	}
}

CreateNewAccommodation.propTypes = {
	user: PropTypes.object
};
CreateNewAccommodation.defaultProps = {};

const mapStateToProps = state => ({
	user: state.user.user
});

const mapDispatchToProps = {};

const Sidebar = styled(SidebarBase)`
	padding: 20px;
	display: flex;
	flex-direction: column;
`;

const AbsoluteCtaContainer = styled.div`
	position: absolute;
	top: 35px;
	right: 30px;
`;

const NoImagesContainer = styled.div`
	min-height: 250px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	img {
		width: 100px;
		margin-bottom: 1em;
	}
	p {
		font-weight: 900;
		text-transform: uppercase;
	}
`;

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CreateNewAccommodation);