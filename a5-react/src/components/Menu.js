import { Component } from "react";
import MenuItem from "./MenuItem";

class Menu extends Component{

  render(){
    return(
      <div className="container m-3">
        <table className="table table-success table-hover table-bordered">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Category</th>
              <th scope="col">Description</th>
              <th scope="col">Price</th>
              <th scope="col">Vegetarian?</th>
            </tr>
          </thead>
          <tbody>
            {this.props.items.map(item => <MenuItem key={item.id} item={item} isSelected={this.props.selectedItem.id === item.id} onClickRow={this.props.onClickRow}/>)}
          </tbody>
        </table>        
      </div>
    )
  }
}

export default Menu;