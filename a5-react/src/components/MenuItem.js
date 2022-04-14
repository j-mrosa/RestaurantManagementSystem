import { Component } from "react";

class MenuItem extends Component{
  render(){
    const {item} = this.props;
    return(
      <tr onClick={() => this.props.onClickRow(item)} className={this.props.isSelected ? 'table-warning' : ''}>  
        <th scope="row">{item.id}</th>
        <td>{item.category}</td>
        <td>{item.description}</td>
        <td>{item.price}</td>
        <td>{item.vegetarian ? 'Yes' : 'No'}</td>
      </tr>
    )
  }
}

export default MenuItem;