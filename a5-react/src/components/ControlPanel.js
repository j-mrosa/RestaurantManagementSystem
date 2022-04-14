import { Component } from "react";
const DEFAULT_BTN = "btn btn-primary btn-lg border-2 border-secondary m-2 ";

class ControlPanel extends Component{  
  
  defineClasses(){
    let classes = DEFAULT_BTN;
    classes += this.props.selectedItem.id === '' ? 'disabled' : '';    
    return classes;
  }
  
  render(){
    return(
      <div className="container text-center">
        <div className={DEFAULT_BTN} id='addBtn' onClick={this.props.onClickAdd}>Add</div>
        <div className={this.defineClasses()} id='deleteBtn' onClick={this.props.onClickDelete}>Delete</div>
        <div className={this.defineClasses()} id='updateBtn' onClick={this.props.onClickUpdate}>Update</div>
      </div>
    )
  }  
}

export default ControlPanel;