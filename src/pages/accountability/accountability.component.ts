import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { TransactionListComponent } from '../transaction-list/transaction-list.component';

import { LoggerService } from "../../common/log/logger.service";
import { UtilService } from "../../common/util/util.service";

import { AccountabilityService } from './accountability.service';

@Component({
  selector: 'page-home',
  templateUrl: 'accountability.component.html'
})
export class AccountabilityComponent {

  /**
   * @description Data received from parent
   * @private 
   */
  private parentData: any = null;

  /**
  * @description item list to be displayed
  * @private 
  */
  private items: Array<any>;

  /**
  * @description Title of component
  * @private 
  */
  private title:string;

  /**
   * @description Sum of all the item's price
   * @private 
   */
  private totalAmount:number;

/**
  * @constructor 
  * @param navCtrl Navigation Controller
  * @param navParams It is used to retrieve navigation parameters
  * @param logger Logger Service
  * @param utilService Utility Service
  * @param accountabilityService Accountability Page Service
  */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private logger: LoggerService,
    private utilService: UtilService,
    private accountabilityService: AccountabilityService) {

      this.parentData = navParams.get('parentData');
      this.loadData();
  }

  /**
   * @description Function to load the list of items and other data related to this component
   */
  loadData() {
    var context = this;
    
    if(!context.parentData || !context.parentData.item || !context.parentData.storeId) {
      context.logger.error('AccountabilityComponent --> Error in retrieving parent data');
      return;
    }

    context.title = context.parentData.item.title;

    context.storage.get(context.parentData.storeId).then((store) => {
        if (store === null || typeof store === 'undefined') {  //  True: when no value is stored in storage

          context.accountabilityService.getData(context.parentData.item.id).subscribe(data => {
            context.items = data.accountabilities;
            
            context.totalAmount = context.utilService.getTotal(context.items, 'price', 'isActive');
            context.storage.set(context.parentData.storeId, JSON.stringify(context.items));
          });

        } else {
          context.items = JSON.parse(store);
          context.totalAmount = context.utilService.getTotal(context.items, 'price', 'isActive');
        }
      });
    }

  /**
   * @description Function to load the Transaction List Page
   * @param item {Accountability Object} Selected object from Accountability List
   */
  loadTransactionListPage(selectedItem) {
    this.navCtrl.push(TransactionListComponent, {
       parentData: {
        item: selectedItem
      }
    });
  }
}