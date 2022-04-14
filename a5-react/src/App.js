import { Component } from 'react';
import './App.css';
import { getAllItems, deleteItem, createOrUpdateItem } from './ajaxFunctions';
import ControlPanel from './components/ControlPanel';
import Menu from './components/Menu';
import FormPanel from './components/FormPanel';

const ERR_MSG = 'The request could not be completed';
const DEFAULT_ITEM = { id: '', category: 'APP', description: '', price: '', vegetarian: false};

class App extends Component {
  constructor() {
    super()
    this.state = {
      itemsArr: [],
      selectedItem: DEFAULT_ITEM,
      formState: "hidden",
    }
  }

  componentDidMount() {
    //make an api call
    getAllItems((arr) => {
      //check response
      if (arr !== null) {
        //if successful, use the results to set the state
        this.setState({ itemsArr: arr });
      } else {
        //otherwise display an error msg
        alert(ERR_MSG);
      }
    });
  }

  handleClickRow = (item) => {
    //get the index of item selected
    let index = this.state.itemsArr.indexOf(item);

    //add selected property and assign true to the selected item
    const selectedItem = this.state.itemsArr[index];

    //set itemsArr and selected item in the state
    this.setState({selectedItem: selectedItem });
  }

  removeAllSelections = () => {
    this.setState({ selectedItem: DEFAULT_ITEM});
  }

  handleDeleteClick = () => {
    //get id of selected item
    const id = this.state.selectedItem.id;

    //make an api call
    deleteItem(id, (res) => {
      //check call results
      if (res !== null && res.ok) {
        //if successful, diplay success msg and get new array of items
        alert("Item " + id + " deleted.");
        getAllItems((res2) => { this.setState({ itemsArr: res2 }) });
      } else {
        //otherwise, display a error alert
        alert(ERR_MSG);
      }
    });

    this.removeAllSelections();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    //clone the selected item
    let clonedItem = { ...this.state.selectedItem };
    //convert id and price to numbers
    clonedItem.id = Number(clonedItem.id);
    clonedItem.price = Number(clonedItem.price);

    //make an api call sending item, form state (adding/updating)
    createOrUpdateItem(clonedItem, this.state.formState, (res) => {
      //check response
      if (res !== null && res.ok) {
        //if request was successful, get items and set new state
        getAllItems((res) => { this.setState({ itemsArr: res }); });
        
        //hide form
        this.setState({ formState: 'hidden' });

        //remove table selections
        this.removeAllSelections();
      } else {
        //display alert in case of an error
        alert(ERR_MSG + '\nID already exists');
      }
    })
  }

  handleCancel = () => {
    //hide form and remove selections
    this.setState({ formState: 'hidden' });
    this.removeAllSelections();
  }

  handleInputChange = (e) => {
    //update selected item using form data
    let newItem = { ...this.state.selectedItem };
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    newItem[e.target.name] = value;

    //set state: update selected item with new info
    this.setState({ selectedItem: newItem });
  }

  handleAddClick = () => {
    //remove selected items
    this.removeAllSelections();
    //set form state
    this.setState({ formState: "Adding" });
  }

  handleUpdateClick = () => {
    //set form state
    this.setState({ formState: "Updating" });
  }

  render() {
    console.log('rendering App');
    return (
      <div className='row'>
        <h1 className='display-1 text-center my-5'> Menu Items Management</h1>

        <div className={'col-12 text-center ' + this.state.formState}>
          <FormPanel selectedItem={this.state.selectedItem} formState={this.state.formState} onCancel={this.handleCancel} onSubmit={this.handleSubmit} onInputChange={this.handleInputChange} />
        </div>

        <div className={'col-12 text-center table' + this.state.formState}>
          <ControlPanel selectedItem={this.state.selectedItem} onClickAdd={this.handleAddClick} onClickUpdate={this.handleUpdateClick} onClickDelete={this.handleDeleteClick} />
          <div className="d-flex justify-content-center">
            <Menu selectedItem={this.state.selectedItem} items={this.state.itemsArr} onClickRow={this.handleClickRow} />
          </div>
        </div>
      </div>
    )
  }
}

export default App;