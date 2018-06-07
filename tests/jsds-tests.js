const assert = require('chai').assert
const expect = require('chai').expect

let JSDS = require('../src/jsds')

describe('upon creation', () => {

    it('Create Store', () => {
        let store1 = JSDS.create('store1')
        expect(store1.id).to.equal('store1')

        let store2 = JSDS.create('store2')
        expect(store2).to.not.equal(store1)
        expect(store2.id).to.equal('store2')
        JSDS.clear()
    })

    it('Get Created Store', () => {
        let myStore = JSDS.create('my_store')
        expect(JSDS.get('my_store')).to.equal(myStore)
        JSDS.clear()
    })

    it('Creating PreExisting Store Throws Exception', () => {
        JSDS.create('happy')
        expect(() => {
            JSDS.create('happy')
        }).to.throw('Cannot overwrite existing data store "happy"!')
        JSDS.clear()
    })

    it('Store Creation Without Identifier', () => {
        expect(JSDS.create().id).to.not.be.undefined
        JSDS.clear()
    })

})

describe('when tracking different stores', () => {

    it('Get Store Count', () => {
        let i=0;
        for (;i<100;i++) {
            JSDS.create();
        }
        expect(JSDS.count()).to.equal(100)
        JSDS.clear()
    })

    it('Get Store Ids', () => {
        JSDS.create('a');
        JSDS.create('b');
        JSDS.create('c');

        let result = JSDS.ids();

        expect(result).to.deep.equal(['a', 'b', 'c'])
        JSDS.clear()
    })
})

describe('when storing and retrieving', () => {

    let store

    function setUp() {
        if (store) {
            store.remove()
            delete store
        }
        store = JSDS.create('store')
    }

    function tearDown() {
    }

    it('Store String Value', () => {
        setUp()
        store.set('city', 'Cupertino')
        let storedValue = store.get('city')
        expect(storedValue).to.equal('Cupertino')

        store.set('city', 'San Jose')
        storedValue = store.get('city')
        expect(storedValue).to.equal('San Jose')
    })


    it('Store Number Value', () => {
        setUp()
        store.set('price', 5.55);
        let storedValue = store.get('price')
        expect(storedValue).to.equal(5.55)

        store.set('price', 3.14)
        storedValue = store.get('price')
        expect(storedValue).to.equal(3.14)
    })

    it('Store Object Value', () => {
        setUp()
        let chicken = {
            name: 'Susie', eggs: 3, farm:'Hillsboro Farms'
        }
        store.set('chicken', chicken)

        let gotChicken = store.get('chicken')

        expect(gotChicken).to.equal(chicken)
        expect(store.get('chicken.name')).to.equal('Susie')
        expect(store.get('chicken', 'eggs')).to.equal(3)
    })

    it('Updating Doesnt Clobber Existing Data', () => {
        setUp()
        let chicken = {
            name: 'Susie', eggs: 3, farm:'Hillsboro Farms'
        };
        store.set('chicken', chicken);

        let newchick = { eggs: 4};

        expect(store.get('chicken.name')).to.equal('Susie')
        expect(store.get('chicken', 'eggs')).to.equal(3)

        store.set('chicken', newchick, {update: true});

        expect(store.get('chicken', 'eggs')).to.equal(4)
        expect(store.get('chicken.name')).to.equal('Susie')
        expect(store.get('chicken.farm')).to.equal('Hillsboro Farms')
    })

    it('Updating Doesn\'t Clobber Existing Data with Deep Structure', () => {
        setUp()
        let val = {
            animals: {
                reptiles: {
                    turtles: ['Victor']
                },
                mammals: {
                    primates: {
                        humans: {
                            Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
                        }
                    },
                    dogs: ['Sasha', 'Ann-Marie']
                }
            }
        };

        store.set('stuff', val);

        let newVal = {
            animals: {
                reptiles: {
                    lizards: ['Izzy']
                },
                mammals: {
                    primates: {
                        humans: {
                            Simpsons: ['Homer', 'Bart', 'Marge', 'Lisa', 'Maggie']
                        }
                    },
                    dogs: ['Scooby']
                }
            }
        };

        store.set('stuff', newVal, { update: true });

        let result = store.get('stuff.animals.reptiles.turtles');
        expect(result).to.deep.equal(['Victor'])

        result = store.get('stuff.animals.reptiles.lizards');
        expect(result).to.deep.equal(['Izzy'])

        result = store.get('stuff.animals.mammals.primates.humans');
        expect(result).to.deep.equal({
            Simpsons: ['Homer', 'Bart', 'Marge', 'Lisa', 'Maggie'],
            Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
        })

        result = store.get('stuff.animals.mammals.dogs');
        expect(result).to.deep.equal(['Sasha', 'Ann-Marie', 'Scooby'])
    })

    it('Updating Arrays Doesnt Clobber Existing Values', () => {
        setUp()
        store.set('obj', {arr:['one','two','three']});
        store.set('obj.arr', ['red'], {update: true});
        let res = store.get('obj.arr');
        expect(res).to.deep.equal(['one','two','three', 'red'])

    })

    it('Updating Arrays Adds New Values To End Of Array', () => {
        setUp()
        store.set('arr', ['one','two','three']);
        store.set('arr', ['red'], {update: true});
        let res = store.get('arr');
        expect(res).to.deep.equal(['one','two','three', 'red'])
    })

    it('Updating Arrays Doesn\'t Duplicate Array Values', () => {
        setUp()
        store.set('arr', ['one','two','three']);
        store.set('arr', ['red', 'two'], {update: true});
        let res = store.get('arr');
        expect(res).to.deep.equal(['one','two','three','red'])
    })

    it('Store Returns Previous Value', () => {
        setUp()
        store.set('city', 'Cupertino');
        let prev = store.set('city', 'San Jose');
        expect(prev).to.equal('Cupertino')
    })

    it('Store Returns Undefined When Storing First Value', () => {
        let result = store.set('pig', 'Fluffy');
        expect(result).to.be.undefined
    })

    it('Store Returns Old Value When Storing Another Value', () => {
        store.set('pig', 'Fluffy');
        let result = store.set('pig', 'Orson');
        expect(result).to.equal('Fluffy')
    })

    it('Namespace Storage Combined Dots', () => {
        store.set('people', {males: ['Dean', 'Matt']});
        let result = store.get('people.males');
        expect(result).to.deep.equal(['Dean', 'Matt'])
    })

    it('Namespace Storage Separated No Dots', () => {
        store.set('people', {males: ['Dean', 'Matt']});
        let result = store.get('people', 'males');
        expect(result).to.deep.equal(['Dean', 'Matt'])
    })

// 		testNamespaceStorage_CombinedDots_Deep: function() {
// 			let val = {
// 				animals: {
// 					reptiles: {
// 						turtles: ['Victor']
// 					},
// 					mammals: {
// 						primates: {
// 							humans: {
// 								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
// 							}
// 						},
// 						dogs: ['Sasha', 'Ann-Marie']
// 					}
// 				}
// 			};
//
// 			store.set('stuff', val);
//
// 			let result = store.get('stuff');
//
// 			a.isObject(result, 'result should have been an object');
//
// 			result = store.get('stuff.animals.reptiles.lizards');
// 			a.isUndefined(result, 'query for lizards should be undefined');
//
// 			result = store.get('stuff', 'animals', 'reptiles', 'turtles');
// 			a.isArray(result, 'result should have been an array');
// 			a.areEqual(1, result.length, 'result should have length of 1');
// 			a.areEqual('Victor', result[0]);
//
// 			result = store.get('stuff', 'animals', 'mammals', 'primates', 'humans');
//
// 			a.isObject(result, 'result should have been an object');
// 			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
// 			a.areEqual('Matt', result.Taylors[0]);
// 			a.areEqual('Romy', result.Taylors[3]);
// 		},
//
// 		testNamespaceStorage_SeparatedNoDots_Deep: function() {
// 			let val = {
// 				animals: {
// 					reptiles: {
// 						turtles: ['Victor']
// 					},
// 					mammals: {
// 						primates: {
// 							humans: {
// 								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
// 							}
// 						},
// 						dogs: ['Sasha', 'Ann-Marie']
// 					}
// 				}
// 			};
//
// 			store.set('stuff', val);
//
// 			let result = store.get('stuff');
//
// 			a.isObject(result, 'result should have been an object');
//
// 			result = store.get('stuff.animals.reptiles.turtles');
// 			a.isArray(result, 'result should have been an array');
// 			a.areEqual(1, result.length, 'result should have length of 1');
// 			a.areEqual('Victor', result[0]);
//
// 			result = store.get('stuff.animals.mammals.primates.humans');
//
// 			a.isObject(result, 'result should have been an object');
// 			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
// 			a.areEqual('Matt', result.Taylors[0]);
// 			a.areEqual('Romy', result.Taylors[3]);
// 		},
//
// 		testNamespaceStorage_COMBO_Deep: function() {
// 			let val = {
// 				animals: {
// 					reptiles: {
// 						turtles: ['Victor']
// 					},
// 					mammals: {
// 						primates: {
// 							humans: {
// 								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
// 							}
// 						},
// 						dogs: ['Sasha', 'Ann-Marie']
// 					}
// 				}
// 			};
//
// 			store.set('stuff', val);
//
// 			let result = store.get('stuff');
//
// 			a.isObject(result, 'result should have been an object');
//
// 			result = store.get('stuff.animals', 'reptiles.turtles');
// 			a.isArray(result, 'result should have been an array');
// 			a.areEqual(1, result.length, 'result should have length of 1');
// 			a.areEqual('Victor', result[0]);
//
// 			result = store.get('stuff', 'animals.mammals.primates' , 'humans');
//
// 			a.isObject(result, 'result should have been an object');
// 			a.areEqual(4, result.Taylors.length, 'result should have length of 4');
// 			a.areEqual('Matt', result.Taylors[0]);
// 			a.areEqual('Romy', result.Taylors[3]);
// 		},
//
// 		testStoreIntoNonExistantNamespace: function() {
// 			store.set('stuff.test', 'pygmies');
// 			let result = store.get('stuff', 'test');
// 			a.areEqual('pygmies', result);
// 		},
//
// 		testStoreReturnsPreviousValue_FromNestedNamespace: function() {
// 			store.set('stuff.test', 'pygmies');
// 			let old = store.set('stuff.test', 'kidneys');
// 			a.areEqual('pygmies', old);
// 		},
//
// 		testClear: function() {
// 			store.set('stuff', 'frogs');
// 			a.areEqual('frogs', store.get('stuff'));
// 			store.clear();
// 			a.isUndefined(store.get('stuff'));
// 		},
//
// 		testDelete: function() {
// 			let soonDeleted = JSDS.create('removeme');
// 			soonDeleted.remove();
// 			a.isUndefined(JSDS._stores['removeme']);
// 		},
//
// 		testStoreHugeTextBlob: function() {
// 			let blob = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> <br/><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"> <br/>  <head> <br/>	<meta http-equiv="X-UA-Compatible" content="IE=8"> <br/>	<script type="text/javascript"> <br/>//<![CDATA[<br/>let matches,url,path,domain;url=document.location.toString();try{domain=url.match(/https?:\/\/[^\/]+/);if(matches=url.match(/(.+?)#(.+)/)){url=matches[1];path=matches[2];if(path){let arr=path.split(/\?/);path=arr[0];let params=arr[1];path=path.replace(/^\//,"");let redirect_url=[domain,path].join("/");if(params){redirect_url=[redirect_url,params].join("?")}document.location=redirect_url}}}catch(err){};<br/>//]]><br/></script>	<script type="text/javascript"> <br/>//<![CDATA[<br/>let page={};let onCondition=function(D,C,A,B){D=D;A=A?Math.min(A,5):5;B=B||100;if(D()){C()}else{if(A>1){setTimeout(function(){onCondition(D,C,A-1,B)},B)}}};<br/>//]]><br/></script> <br/>	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" /> <br/><meta content="en-us" http-equiv="Content-Language" /> <br/><meta content="Twitter is without a doubt the best way to share and discover what is happening right now." name="description" /> <br/><meta content="no" http-equiv="imagetoolbar" /> <br/><meta content="width = 780" name="viewport" /> <br/><meta content="4FTTxY4uvo0RZTMQqIyhh18HsepyJOctQ+XTOu1zsfE=" name="verify-v1" /> <br/><meta content="1" name="page" /> <br/><meta content="NOODP" name="robots" /> <br/><meta content="y" name="session-loggedin" /> <br/><meta content="6797182" name="session-userid" /> <br/><meta content="rhyolight" name="session-user-screen_name" /> <br/>	<title id="page_title">Twitter / Home</title> <br/>	<link href="http://a1.twimg.com/a/1279322210/images/favicon.ico" rel="shortcut icon" type="image/x-icon" /> <br/><link href="http://a1.twimg.com/a/1279322210/images/twitter_57.png" rel="apple-touch-icon" /> <br/><link rel="alternate" href="http://twitter.com/statuses/friends_timeline.rss" title="Your Twitter Timeline" type="application/rss+xml" /> <br/><link rel="alternate" href="http://twitter.com/statuses/replies.rss" title="Your Twitter @rhyolight Mentions" type="application/rss+xml" /> <br/><link rel="alternate" href="http://twitter.com/favorites/6797182.rss" title="Your Twitter Favorites" type="application/rss+xml" /> <br/> <br/>	<br/>	<link href="http://a3.twimg.com/a/1279322210/stylesheets/twitter.css?1279326324" media="screen" rel="stylesheet" type="text/css" /> <br/><link href="http://a3.twimg.com/a/1279322210/stylesheets/geo.css?1279326324" media="screen" rel="stylesheet" type="text/css" /> <br/><link href="http://a0.twimg.com/a/1279322210/stylesheets/buttons_new.css?1279326324" media="screen" rel="stylesheet" type="text/css" /> <br/>		<style type="text/css"> <br/>	  <br/>		body {<br/>  background: #022330 url(\'http://a1.twimg.com/profile_background_images/55715982/ornate_small1.png\') fixed repeat;<br/> <br/>}<br/> <br/>body#show #content .meta a.screen-name,<br/>#content .shared-content .screen-name,<br/>#content .meta .byline a {<br/>  color: #0084B4;<br/>}<br/> <br/>/* Link Color */<br/>a,<br/>#content tr.hentry:hover a,<br/>body#profile #content div.hentry:hover a,<br/>#side .stats a:hover span.stats_count,<br/>#side div.user_icon a:hover,<br/>li.verified-profile a:hover,<br/>#side .promotion .definition strong,<br/>p.list-numbers a:hover,<br/>#side div.user_icon a:hover span,<br/>#content .tabMenu li a,<br/>.translator-profile a:hover,<br/>#local_trend_locations li a,<br/>.modal-content .list-slug,<binput id="tab_action" name="tab" type="hidden" value="index" /> <br/>  <fieldset class="common-form standard-form"> <br/>	<div class="bar"> <br/>	  <h3><label for="status" class="doing">What&rsquo;s happening?</label></h3> <br/>	  <span id="chars_left_notice" class="numeric"> <br/>		<strong id="status-field-char-counter" class="char-counter"></strong> <br/>	  </span> <br/>	</div> <br/>	<div class="info"> <br/>	  <textarea cols="40" rows="2" id="status" name="status" accesskey="u" autocomplete="off" tabindex="1"></textarea> <br/>	  <div id="tweeting_controls"> <br/>		<a href="#" tabindex="2" id="tweeting_button" class="a-btn a-btn-m"><span>Tweet</span></a> <br/>	  </div> <br/>			<div class="status-btn" style="display:none"> <br/>		<input type="submit" name="update" value="update" id="update-submit" class="status-btn round-btn" tabindex="2" /> <br/>	  </div> <br/>	  <div id="update_notifications"> <br/>				  <div id="geo_status" class="position_container"></div> <br/>				<br/>		  <div id="latest_status"> <br/>			<span id="latest_status"><span id="latest_text"><span class="status-text"></span><span id="latest_meta" class="entry-meta">&nbsp;about 1 hour ago</span></span><span id="latest_text_full"><strong>Latest: </strong><span class="status-text">@<a class="tweet-url username" href="/michaelg" rel="nofollow">michaelg</a> Not to mention The Atomic Bitchwax, High on Fire, Baroness, Shrinebuilder, Orange Goblin, etc.</span> <br/>	  <span class="entry-meta"> <br/>		<a href="http://twitter.com/rhyolight/status/18943593462" class="entry-date" rel="bookmark"><span class="published" title="2010-07-19T21:09:54+00:00">about 1 hour ago</span></a>&nbsp;<span>from <a href="http://mowglii.com/itsy" rel="nofollow">Itsy!</a></span><a href="http://twitter.com/michaelg/status/18943009920">&nbsp;in reply to michaelg</a> <br/>	</span> <br/>  </span></span> <br/> <br/> <br/>		  </div> <br/>		<br/>	  </div> <br/>	  <div class="clear"></div> <br/>	</div> <br/>  </fieldset> <br/></form> <br/> <br/>		</div> <br/><div id="dm_update_box"><form action="/direct_messages" class="status-update-form" id="direct_message_form" method="post"><div style="margin:0;padding:0"><input name="authenticity_token" type="hidden" value="15874bb0ca09aa5b5ede1513c9188238cd718943" /></div>  <fieldset class="common-form standard-form"> <br/>	<div class="bar"> <br/>	  <h3> <br/>		<label for="doing"> <br/>		  Send <select name="user[id]" id="direct_message_user_id" accesskey=">" tabindex="3"></select> a direct message.<br/>		</label> <br/>	  </h3> <br/>	  <span id="chars_left_notice" class="numeric"> <br/>		<strong id="status-field-char-counter" class="char-counter"></strong> <br/>	  </span> <br/>	</div> <br/>	<div class="info"> <br/>	  <textarea accesskey="u" autocomplete="off" cols="15" id="text" name="text" rows="3" tabindex="4"></textarea> <br/>	</div> <br/>	<div class="status-btn"> <br/>	  <input type="submit" name="update" value="send" id="dm-submit" class="round-btn dm-btn" tabindex="4" /> <br/>	  <input id="direct_message_screen_name" name="screen_name" type="hidden" value="" /> <br/>	  <input id="tab_action" name="tab" type="hidden" value="index" /> <br/>	</div> <br/>  </fieldset> <br/></form> <br/></div> <br/> <br/><div id="user_search_results" class="section onebox_users"> <br/>  <h2>Name results for <strong></strong></h2> <br/>  <p class="seeall"><a href="#">View all name search results &raquo;</a></p> <br/>  <ul /> <br/></div> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/><div class="section"> <br/>  <br/> <br/>  <br/> <br/>  <div id="timeline_heading"> <br/>	<h1 id="heading"><span id="title">Home</span></h1> <br/>	<div id="geo_place_details"> <br/>  <br/></div> <br/> <br/> <br/>	<ul id="dm_tabs" class="tabMenu"> <br/>	  <li id="inbox_tab"><a href="http://twitter.com/inbox" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;inbox&quot;}"><span>Inbox</span></a></li> <br/>	  <li id="sent_tab"><a href="http://twitter.com/sent" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;sent&quot;}"><span>Sent</span></a></li> <br/>	</ul> <br/> <br/>	<br/> <br/>		  <ul id="retweet_tabs" class="tabMenu"> <br/>		<li id="retweets_by_others_tab"><a href="http://twitter.com/retweets_by_others" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;retweets_by_others&quot;}"><span>Retweets by others</span></a></li> <br/>		<li id="retweets_tab"><a href="http://twitter.com/retweets" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;retweets&quot;}"><span>Retweets by you</span></a></li> <br/>		<li id="retweeted_of_mine_tab"><a href="http://twitter.com/retweeted_of_mine" class="in-page-link" data="{&quot;dispatch_action&quot;:&quot;retweeted_of_mine&quot;}"><span>Your tweets, retweeted</span></a></li> <br/>	  </ul> <br/>	  </div> <br/> <br/>  <div class="trend-description-container"> <br/>	<div id="trend_descriptionlabel class="title">Description</label> <br/>	  <textarea id="list_description" name="list[description]" class="list-description title" maxlength="100"></textarea> <br/>	  <div class="list-description-instruction">Under 100 characters, optional</div> <br/>	</fieldset> <br/>	<fieldset class=\'clear bottom\'> <br/>	  <label class="title">Privacy</label> <br/>	  <div class="options"> <br/>		<label class="radio"><input type="radio" name="list[mode]" value="0" checked="checked" /> <strong>Public</strong> &mdash; Anyone can subscribe to this list.</label> <br/>		<label class="radio"><input type="radio" name="list[mode]" value="1" /> <strong>Private</strong> &mdash; Only you can access this list.</label> <br/>	  </div> <br/>	  <div class="private-warning"> <br/>		<strong>Are you sure?</strong> <br/>		<p>Switching your list from public to private will remove all of its subscribers.</p> <br/>	  </div> <br/>	</fieldset> <br/>	<input id="authenticity_token" name="authenticity_token" type="hidden" value="15874bb0ca09aa5b5ede1513c9188238cd718943" /> <br/>	<input type="submit" class="btn create-list-button submit" value="Create list" /> <br/>	<input type="submit" class="btn update-list-button submit" value="Update list" /> <br/>	<input type="hidden" class="list-member-id" name="list[member][id]" /> <br/>	<input type="hidden" class="list-slug-field" name="list[slug]" /> <br/>  </form> <br/>  </div> <br/></div> <br/> <br/><h2 id="list_dialog_header" style="display: none;"> <br/>  <span class="create-list-heading">Create a new list</span> <br/>  <span class="update-list-heading">Update this list</span> <br/></h2> <br/> <br/><div id="list_no_members_owner" style="display: none;"> <br/>  <div class="no-members"> <br/>  <h3>Find people to add to your list:</h3> <br/>  <form action="http://twitter.com/search/users" method="get">  <fieldset class="common-form"> <br/>				<input class="medium" id="q" name="q" type="text" />	  <input type="hidden" name="category" value="people" /> <br/>	  <input type="hidden" name="source" value="users" /> <br/>	  <input class="submit btn" id="search_users_submit" type="submit" value="search" />	  <p class="instruction">Search for a username, first or last name, business or brand</p> <br/>			</fieldset> <br/></form>  <p class="tip">You can also add people from your <a href="/following">Following</a> page or anyone’s profile page.</p> <br/></div> <br/></div> <br/><div id="list_no_members" style="display: none;"> <br/>  <p class="no-members">This list doesn’t follow any users yet. It probably will soon, though.</p> <br/> <br/></div> <br/> <br/>  <br/> <br/>				  </div> <br/>								</td> <br/>			  <br/>			</tr> <br/>		  </tbody> <br/>		</table> <br/>	  <br/> <br/>	  <br/>  <div id="footer" class="round"> <br/>	  <h3 class="offscreen">Footer</h3> <br/>	  <br/>	  <br/>	  <ul class="footer-nav"> <br/>		  <li class="first">&copy; 2010 Twitter</li> <br/>		  <li><a href="/about">About Us</a></li> <br/>		  <li><a href="/about/contact">Contact</a></li> <br/>		  <li><a href="http://blog.twitter.com">Blog</a></li> <br/>		  <li><a href="http://status.twitter.com">Status</a></li> <br/>					  <li><a href="/goodies">Goodies</a></li> <br/>					<li><a href="http://dev.twitter.com/">API</a></li> <br/>					  <li><a href="http://business.twitter.com/twitter101">Business</a></li> <br/>					<li><a href="http://support.twitter.com">Help</a></li> <br/>		  <li><a href="/jobs">Jobs</a></li> <br/>		  <li><a href="/tos">Terms</a></li> <br/>		  <li><a href="/privacy">Privacy</a></li> <br/>	  </ul> <br/>  </div> <br/> <br/> <br/> <br/>	  <hr /> <br/> <br/>	</div> <br/> <br/>	<br/> <br/>	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.0/jquery.min.js" type="text/javascript"></script> <br/><script src="http://a2.twimg.com/a/1279322210/javascripts/twitter.js?1279326324" type="text/javascript"></script> <br/><script src="http://a1.twimg.com/a/1279322210/javascripts/lib/jquery.tipsy.min.js?1279326324" type="text/javascript"></script> <br/><script type=\'text/javascript\' src=\'http://www.google.com/jsapi\'></script> <br/><script src="http://a0.twimg.com/a/1279322210/javascripts/lib/gears_init.js?1279326324" type="text/javascript"></script> <br/><script src="http://a1.twimg.com/a/1279322210/javascripts/lib/mustache.js?1279326324" type="text/javascript"></script> <br/><script src="http://a2.twimg.com/a/1279322210/javascripts/geov1.js?1279326324" type="text/javascript"></script> <br/><script src="http://a0.twimg.com/a/1279322210/javascripts/api.js?1279326324" type="text/javascript"></script> <br/>  <script src="http://a1.twimg.com/a/1279322210/javascripts/lib/mustache.js?1279326324" type="text/javascript"></script> <br/><script src="http://a2.twimg.com/a/1279322210/javascripts/dismissable.js?1279326324" type="text/javascript"></script> <br/>  <br/>	<script src="http://a0.twimg.com/a/1279322210/javascripts/api.js?1279326324" type="text/javascript"></script> <br/><script src="http://a3.twimg.com/a/1279322210/javascripts/controls.js?1279326324" type="text/javascript"></script> <br/><script src="http://a0.twimg.com/a/1279322210/javascripts/hover_cards.js?1279326324" type="text/javascript"></script> <br/>  <br/> <br/><script type="text/javascript"> <br/>//<![CDATA[<br/>  page.query = \'\';<br/>  page.prettyQuery = \'\';<br/>  <br/>  page.locale = \'en\';<br/>  <br/>	page.showSS = true;<br/>  <br/>	  page.controller_name = \'TimelineController\';<br/>	  page.action_name = \'home\';<br/>	  twttr.form_authenticity_token = \'15874bb0ca09aa5b5ede1513c9188238cd718943\';<br/>	  $.ajaxSetup({ data: { authenticity_token: \'15874bb0ca09aa5b5ede1513c9188238cd718943\' } });<br/> <br/>	  // FIXME: Reconcile with the kinds on the Status model.<br/>	  twttr.statusKinds = {<br/>		UPDATE: 1,<br/>		SHARE: 2<br/>	  };<br/>	  twttr.ListPerUserLimit = 20;<br/> <br/>	  <br/> <br/>	<br/>//]]><br/></script> <br/><script type="text/javascript"> <br/>//<![CDATA[<br/> <br/>	  $( function () {<br/>		$(\'#latest_status\').isCurrentStatus();<br/>	  (function() {<br/>	  <br/>		twttr.geo.IP = \'209.131.62.113\';<br/>	  <br/>		setTimeout(function() {<br/>		  $.extend(twttr.geo.options, {<br/>			more_places: true,<br/>			autocomplete: true,<br/>			autocomplete_zero_delay: false,<br/>			place_creation: true,<br/>			place_creation_needs_high_accuracy: false,<br/>			allow_set_location_manually: true,<br/>			show_place_details_in_map: true,<br/>			show_similar_places: true,<br/>			nearby_activity: false<br/>		  });<br/>		  new twttr.geo.UpdateUi({<br/>			geo_enabled: true,<br/>			has_dismissed_geo_promo: false,<br/>			current_user_path: "/users/6797182",<br/>			granularity: "poi",<br/>			avatarUrl: "http://a3.twimg.com/profile_images/655350303/rhyolight_big_mini.jpg"<br/>		  });<br/>		}, 0);<br/>	  })();<br/>	  $(\'#direct_message_form\').isDirectMessageForm();<br/>  <br/>	if (!($.browser.mshttp://www.");<br/>	document.write(unescape("%3Cscript src=\'" + gaJsHost + "google-analytics.com/ga.js\' type=\'text/javascript\'%3E%3C/script%3E"));<br/>  </script> <br/> <br/>  <script type="text/javascript"> <br/> <br/>	try {<br/>	  let pageTracker = _gat._getTracker("UA-30775-6");<br/>	  pageTracker._setDomainName("twitter.com");<br/>			pageTracker._setVar(\'Logged In\');<br/>			pageTracker._setVar(\'lang: en\');<br/>			pageTracker._initData();<br/>					<br/>		  pageTracker._trackPageview(\'/home\');<br/>				  } catch(err) { }<br/> <br/>  </script> <br/> <br/>  <!-- END google analytics --> <br/> <br/> <br/> <br/> <br/>	<div id="notifications"></div> <br/> <br/> <br/>	<br/> <br/>	<br/>  <br/> <br/> <br/>  </body> <br/> <br/></html>';
//
// 			store.set('blob', blob);
//
// 			a.areSame(blob, store.get('blob'));
// 		}
//
// 	});

})


//     let eventTests = new Y.Test.Case({
//
// 		name : "JSDS event tests",
// 		s: null,
//
// 		setUp : function () {
// 			store = JSDS.create('testStore');
// 		},
//
// 		tearDown : function () {
// 			JSDS.clear();
// 		},
//
// 		test_OnStore_CallbackIsCalled: function () {
// 			let called = false;
// 			store.before('set', function() {
// 				called = true;
// 			});
//
// 			store.set('mama', 'mia');
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		'test multiple listener functions on same event are called': function () {
// 			let called1 = false;
// 			let called2 = false;
// 			store.after('set', 'mama', function() {
// 				called1 = true;
// 			});
// 			store.after('set', 'mama', function() {
// 				called2 = true;
// 			});
//
// 			store.set('mama', 'mia');
//
// 			a.isTrue(called1, 'callback for on set event never called');
// 			a.isTrue(called2, '2nd callback for on set event never called');
// 		},
//
// 		'test calling on function returns a handle to remove it': function () {
//             let called = 0;
// 			let handle = store.after('set', function() {
// 				called++;
// 			});
//
// 			store.set('mama', 'mia');
//             a.areSame(1, called, 'callback for on set event never called');
//
//             handle.remove();
//
//             store.set('mama', 'mia');
//             a.areSame(1, called, 'callback was called after removal');
// 		},
//
// 		test_onStoreEvent_PassesStringStoreValue: function() {
// 			let called = false;
// 			store.after('set', function(value) {
// 				called = true;
// 				a.areEqual('mia', value, 'on set callback passed wrong value');
// 			});
//
// 			store.set('mama', 'mia');
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		test_onStoreEvent_PassesStringStoreValue_WhenDeeper: function() {
// 			let called = false;
// 			store.after('set', function(value) {
// 				called = true;
// 				a.areEqual('abba', value, 'on set callback passed wrong value');
// 			});
//
// 			store.set('mama.mia', 'abba');
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		test_onStoreEventWithKey_PassesObjectStoreValue: function() {
// 			let called = false;
//
// 			store.on('set', {
// 			    key: 'one',
// 			    callback: function(value) {
//     				called = true;
//     				a.areEqual('Phoenix', value, 'on set callback passed wrong value');
//     			}
// 			});
//
// 			store.set('one', 'Phoenix');
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		test_onStoreEventWithDifferentKey_NeverCalled: function() {
// 			let called = false;
//
// 			store.on('set', {
// 			    key: 'one',
// 			    callback: function(type, args) {
//     				called = true;
//     			}
// 			});
//
// 			store.set('two', 'Phoenix');
//
// 			a.isFalse(called, 'callback for on set should not have been called');
// 		},
//
// 		test_onStoreEvent_forSecondDeepKey_PassesObjectStoreValue: function() {
// 			let called = false;
//
// 			store.on('set', {
// 			    key: 'one.two',
// 			    callback: function(value) {
//     				called = true;
//     				a.areEqual('Phoenix', value, 'on set callback passed wrong value');
//     			}
// 			});
//
// 			store.set('one.two', 'Phoenix');
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		test_onStoreEvent_PassesProperNestedValue_NotEntireStore: function() {
// 			let called = false;
// 			store.on('set', {
// 			    key: 'one.two.three',
// 			    callback: function(value) {
//     				called = true;
//     				a.areEqual('the value', value.two.three, 'on set callback passed wrong value');
//     			}
// 			});
//
// 			store.set('one', {two:{three:'the value'}}, {update: true});
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		test_On_Function_CanBePassed_Options: function() {
// 			let called = false;
// 			let fakeScope = {};
// 			store.on('set', {
// 				callback: function() {
// 					called = true;
// 					a.areSame(fakeScope, this, 'bad scope');
// 				},
// 				scope: fakeScope
// 			});
//
// 			store.set('mama', 'mia');
//
// 			a.isTrue(called, 'callback for on set event never called');
// 		},
//
// 		test_On_Function_WorksWith_DotConnectedKeys: function() {
// 		    let called = false;
// 		    store.before('set', 'taco.town', function(key, val) {
//                 called = true;
//                 a.areEqual('taco.town', key, 'on set callback passed wrong key');
//                 a.areEqual('yay', val, 'on set callback passed wrong value');
//             });
//
// 		    store.set('taco.city', 'oops');
//
// 		    a.isFalse(called, 'callback keyed on wrong string with dots was called');
//
// 		    store.set('taco.town', 'yay');
//
// 		    a.isTrue(called, 'callback keyed on string with dots was not called');
// 		},
//
// 		test_OnGet_CallbackIsCalled: function () {
// 			let called = false;
// 			store.after('get', function() {
// 				called = true;
// 			});
//
// 			store.set('mama', 'mia');
// 			store.get('mama');
//
// 			a.isTrue(called, 'callback for on get event never called');
// 		},
//
// 		test_OnClear_CallbackIsCalled: function () {
// 			let called = false;
// 			store.after('clear', function() {
// 				called = true;
// 			});
//
// 			store.clear('mama');
//
// 			a.isTrue(called, 'callback for on clear event never called');
// 		},
//
// 		test_OnRemove_CallbackIsCalled: function () {
// 			let called = false;
// 			store.after('remove', function() {
// 				called = true;
// 			});
//
// 			store.remove();
//
// 			a.isTrue(called, 'callback for on remove event never called');
// 		},
//
// 		test_All_Event_CallbacksAreCalledCorrectTimes: function() {
// 			let storeCb = 0, getCb = 0, clearCb = 0, removeCb = 0;
// 			store.after('set', function() {
// 				storeCb++;
// 			});
// 			store.after('get', function() {
// 				getCb++;
// 			});
// 			store.after('clear', function() {
// 				clearCb++;
// 			});
// 			store.after('remove', function() {
// 				removeCb++;
// 			});
//
// 			store.set('city', 'Miami');  // storeCb      = 1
// 			store.get('city');			    // getCb		= 1
// 			store.set('color', 'red');   // storeCb      = 2
// 			store.get('color');			// getCb		= 2
// 			store.clear();				    // clearCb      = 1
// 			store.remove();				// clearCb      = 2
// 											// removeCb     = 1
// 			a.areEqual(2, storeCb, 'set callback called wrong number of times');
// 			a.areEqual(2, getCb, 'get callback called wrong number of times');
// 			a.areEqual(2, clearCb, 'clear callback called wrong number of times');
// 			a.areEqual(1, removeCb, 'remove callback called wrong number of times');
// 		},
//
// 		test_RemoveEventFired_ForEachStore_WhenEntireStoreIsCleared: function() {
// 			let called = 0;
// 			store.after('remove', function() {
// 				called++;
// 			});
// 			let otherStore = JSDS.create();
// 			otherStore.after('remove', function() {
// 				called++;
// 			});
// 			JSDS.clear();
// 			a.areEqual(2, called, 'on remove callback for individual stores were not called on JSDS.clear()');
// 		},
//
// 		test_EventCallbacks_CanBeExecuted_WithinCustomScope: function() {
// 		    this.wrestler = 'Rowdy Rodney Piper';
// 			store.after('set', function() {
// 			    this.wrestler = 'Hulk Hogan';
// 			}, this);
//
// 			store.set('mama', 'mia');
//
// 			a.areEqual('Hulk Hogan', this.wrestler);
// 			delete this.wrestler;
// 		},
//
//         test_StaticJSDS_OnStore_function: function() {
// 			let ajaxCache = JSDS.create('ajaxCache'),
// 				cityData = {
// 					"Miami": "Florida",
// 					"St. Louis": "Missouri",
// 					"Chicago": "Illinois"
// 				},
// 				retrievedCityData,
// 				callbackCalled = false;
//
// 			ajaxCache.on('set', {
//                 when: 'before',
// 			    id: 'ajaxCache',
// 		        key: 'cityData',
// 		        callback: function(key, data) {
// 		    	    callbackCalled = true;
// 				    retrievedCityData = data;
// 			    }
// 			});
//
// 			ajaxCache.set('cityData', cityData);
//
// 			a.isTrue(callbackCalled, 'Static JSDS callback not called on set');
// 			a.areSame(cityData, retrievedCityData, 'Retrieved data object was not same');
// 		},
//
// 		test_StaticJSDS_OnGet_function: function() {
// 			let ajaxCache = JSDS.create('ajaxCache'),
// 				cityData = {
// 					"Miami": "Florida",
// 					"St. Louis": "Missouri",
// 					"Chicago": "Illinois"
// 				},
// 				retrievedCityData,
// 				callbackCalled = false;
//
// 			ajaxCache.on('get', {
// 			    id:'ajaxCache',
// 			    key:'cityData',
// 			    callback:function(data) {
// 				    callbackCalled = true;
// 				    retrievedCityData = data;
// 			    }
// 			});
//
// 			ajaxCache.set('cityData', cityData);
// 			ajaxCache.get('cityData');
//
// 			a.isTrue(callbackCalled, 'Static JSDS callback not called on get');
// 			a.areSame(cityData, retrievedCityData, 'Retrieved data object was not same');
// 		},
//
// 		testProperCallbackCalledOnUpdate: function() {
// 			let val = {
// 				animals: {
// 					reptiles: {
// 						turtles: ['Victor']
// 					},
// 					mammals: {
// 						primates: {
// 							humans: {
// 								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
// 							}
// 						},
// 						dogs: ['Sasha', 'Ann-Marie']
// 					}
// 				}
// 			};
//
// 			store.set('stuff', val);
//
// 			let dogCallbackCalled = false;
//
// 			store.before('set', 'stuff.animals.mammals.dogs', function(key, data) {
//                 dogCallbackCalled = true;
//                 a.areSame('stuff.animals', key, 'wrong key for set before cb');
//                 a.isArray(data.mammals.dogs);
//                 aa.contains('Buttons', data.mammals.dogs);
//                 aa.contains('Teela', data.mammals.dogs);
//             });
//
// 			store.set('stuff.animals', {
// 				reptiles: {
// 					turtles: ['slowie']
// 				}
// 			}, {update: true});
//
// 			a.isFalse(dogCallbackCalled, 'callback was called when no dog data was updated');
//
// 			store.set('stuff.animals', {
// 				mammals: {
// 					dogs: ['Buttons', 'Teela']
// 				}
// 			}, {update: true});
//
// 			a.isTrue(dogCallbackCalled, 'callback was not called for dog update');
// 		},
//
// 		testUpdateWillOverwriteAndCreateNew: function() {
// 		    let val = {
// 				animals: {
// 					reptiles: {
// 						turtles: ['Victor']
// 					},
// 					mammals: {
// 						primates: {
// 							humans: {
// 								Taylors: ['Matt', 'Trinity', 'Dean', 'Romy']
// 							}
// 						},
// 						dogs: ['Sasha', 'Ann-Marie']
// 					}
// 				}
// 			};
//
// 			store.set('stuff', val, {update: true});
//
// 			let res = store.get('stuff.animals.reptiles');
//
// 			a.areEqual(val.animals.reptiles, res, 'got wrong object back');
//
// 		}
// 	});
//     let wildcardTests = new Y.Test.Case({
//
// 		name : "JSDS tricky wildcard tests",
// 		s: null,
//
// 		setUp : function () {
// 			store = JSDS.create('testStore');
// 		},
//
// 		tearDown : function () {
// 			JSDS.clear();
// 		},
//
// 		testUsingWildcardInKey: function() {
//             let beforeCbCount = 0, afterCbCount = 0;
// 		    let val = {
// 				animals: {
// 					frogs: {
// 					    number: 11,
// 					    area: 'north'
// 					},
// 					lizards: {
// 					    number: 24,
// 					    area: 'east'
// 					}
// 				},
// 				veggies: {
// 				    cucumbers: {
// 				        area: 'west'
// 				    }
// 				}
// 			};
//
// 			store.set('stuff', val);
//
// 			store.before('set', 'stuff.*.*.area', function(key, val) {
//                 beforeCbCount++;
//                 if (beforeCbCount === 1) {
//                     a.areSame('stuff.animals.frogs.area', key);
//                     a.areEqual('south', val);
//                 }
//             });
//
//             store.after('set', 'stuff.*.*.area', function(result) {
//                 afterCbCount++;
//                 if (afterCbCount === 1) {
//                     a.areSame('south', result);
//                 }
//             });
//
// 			store.set('stuff.animals.frogs.area', 'south');
// 			a.areEqual(1, beforeCbCount, 'before callback not called');
// 			a.areEqual(1, afterCbCount, 'after callback not called');
//
// 			store.set('stuff.veggies.squash.area', 'east');
// 			a.areEqual(2, beforeCbCount, 'before callback not called');
// 			a.areEqual(2, afterCbCount, 'after callback not called');
//
// 			store.set('stuff.veggies.squash.number', 444);
// 			a.areEqual(2, beforeCbCount, 'callback not called');
// 			a.areEqual(2, afterCbCount, 'after callback not called');
// 		},
//
// 		testUsingWildcard_AsFirstThing_InKey: function() {
//             let called = 0,
// 				val = {
// 					animals: {
// 						frogs: {
// 						    number: 11,
// 						    area: 'north'
// 						},
// 						lizards: {
// 						    number: 24,
// 						    area: 'east'
// 						}
// 					},
// 					veggies: {
// 					    cucumbers: {
// 					        area: 'west'
// 					    }
// 					}
// 				},
// 				otherval = {animals:{frogs:{area:30}}};
//
// 			store.set('stuff', val);
// 			store.set('otherstuff', otherval);
//
// 			store.before('set', '*.animals.frogs.area', function(k, v) {
//                 called++;
//                 a.areSame('stuff.animals.frogs.area', k);
//                 a.areSame('south', v, 'cb for mutli-matching wildcard sent wrong array values');
//             });
//
// 			store.set('stuff.animals.frogs.area', 'south');
// 			a.areEqual(1, called, 'callback not called');
//
//             store.set('stuff.veggies.squash.area', 'east');
// 			a.areEqual(1, called, 'callback should not have been called');
// 		},
//
//         testSimpleWildcard_FirstPosition: function () {
// 			let called = false;
// 			store.before('set', '*.map.content', function(key, value) {
//                 called = true;
//                 a.areEqual('63336', key);
//                 a.areEqual('yoyoyo', value.map.content);
// 			});
// 			store.set('63336', {
// 				map: {
// 					content: 'yoyoyo'
// 				}
// 			});
// 			a.isTrue(called);
// 		},
//
// 		testSimpleWildcard_FirstPosition_negative: function () {
// 			let called = false;
// 			store.on('set', {
// 				key: '*.map.content',
// 				callback: function(type, args) {
// 					called = true;
// 				}
// 			});
// 			store.set('63336', {
// 				map: {
// 					not_content: 'yoyoyo'
// 				}
// 			});
// 			a.isFalse(called);
// 		},
//
// 		testSimpleWildcard_MiddlePosition: function () {
// 			let called = false;
// 			store.on('set', {
// 				key: '63336.*.content',
// 				callback: function(type, args) {
// 					called = true;
// 				}
// 			});
// 			store.set('63336', {
// 				map: {
// 					content: 'yoyoyo'
// 				}
// 			});
// 			a.isTrue(called);
// 		},
//
// 		testSimpleWildcard_WhenStoringInDeepKey: function () {
// 			let called = false;
// 			store.set('animals', {
// 				frogs: {
// 					number: 11,
// 					area: 'north'
// 				},
// 				lizards: {
// 					number: 24,
// 					area: 'east'
// 				},
// 				veggies: {
// 					cucumbers: {
// 						area: 'west'
// 					}
// 				}
// 			});
//
// 			store.on('set', {
// 				key: 'animals.*.number',
// 				callback: function(type, args) {
// 					called = true;
// 				}
// 			});
// 			store.set('animals.lizards.number', 40);
// 			a.isTrue(called);
// 		}
//
// 	});
//     let setGetTests = new Y.Test.Case({
//
// 		name : "set / get API tests",
// 		s: null,
//
// 		setUp : function () {
// 			store = JSDS.create('testStore');
// 		},
//
// 		tearDown : function () {
// 			JSDS.clear();
// 		},
//
//         'test set stores just like set()': function() {
//             store.set('city', 'Cupertino');
//             let storedValue = store.get('city');
//
//             a.isNotUndefined(storedValue, 'stored value cannot be undefined');
//             a.areEqual('Cupertino', storedValue, 'got back wrong stored value');
//
//             store.set('city', 'San Jose');
//             storedValue = store.get('city');
//
//             a.areEqual('San Jose', storedValue, 'got back wrong stored value after reassignment');
//         }
//     });
//     let beforeAfterTests = new Y.Test.Case({
//
// 		name : "before / after API tests",
// 		s: null,
//
// 		setUp : function () {
// 			store = JSDS.create('testStore');
// 		},
//
// 		tearDown : function () {
// 			JSDS.clear();
// 		},
//
//         // SET
//
//         'test before set cb is called before set occurs': function() {
//             let called = 0,
//                 s = store;
//             store.before('set', 'city', function() {
//                 called++;
//                 a.isUndefined(s.get('city'), 'before callback should be called before event is executed');
//             });
//
//             store.set('city', 'Cupertino');
//
//             a.areSame(1, called, 'before cb never called');
//         },
//
//         'test before set cb is given set value': function() {
//             let called = false;
//             store.before('set', 'city', function(k, v) {
//                 called = true;
//                 a.isNotUndefined(k, 'should have gotten a key');
//                 a.isNotUndefined(v, 'should have gotten a value');
//                 a.areSame('city', k, 'wrong key given to before cb');
//                 a.areSame('Cupertino', v, 'wrong value given to before cb');
//             });
//
//             store.set('city', 'Cupertino');
//             a.isTrue(called, 'cb never called');
//         },
//
// 		'test after set is given raw value when value is falsey': function() {
// 			let value = undefined;
// 			store.after('set', 'fountain', function(v) {
// 				value = v
// 			});
// 			store.set('fountain', 0);
// 			a.areSame(0, value, 'zero value callback was given wrong set value')
// 		},
//
//         'test after set callback is given current and previous value': function() {
//             let value, prev
// 			store.set('my-value', 'prev')
//             store.after('set', 'my-value', function(v, p) {
//                 value = v
// 				prev = p
//             });
//             store.set('my-value', 'current');
//             a.areSame('prev', prev, 'Wrong previous value in after set callback')
//         },
//
//         // 'test before set cb return value overrides call params': function() {
//         //     let called = false;
//         //     store.before('set', 'city', function(k, v) {
//         //         called = true;
//         //         return ['city2', 'Cupertino2'];
//         //     });
// 		//
//         //     store.set('city', 'Cupertino');
// 		//
//         //     a.isUndefined(store.get('city'), 'cb return did not override key, original key was set');
//         //     a.areSame('Cupertino2', store.get('city2'), 'cb return did not override key, override key was not set');
//         //     a.isTrue(called, 'cb never called');
//         // },
//
//         'test after set cb is called after set occurs': function() {
//             let called = 0,
//                 s = store;
//             store.after('set', 'city', function() {
//                 called++;
//                 a.areSame('Cupertino', s.get('city'), 'before callback should be called before event is executed');
//             });
//
//             store.set('city', 'Cupertino');
//
//             a.areSame(1, called, 'after cb never called');
//         },
//
//         // 'test after set cb return value overrides result': function() {
//         //     let called = false;
//         //     store.after('set', 'city', function(storeResult) {
//         //         called = true;
//         //         a.isNotUndefined(storeResult);
//         //         return 'override result';
//         //     });
// 		//
//         //     let result = store.set('city', 'Cupertino');
// 		//
//         //     a.isTrue(called, 'after cb never called');
//         //     a.areSame('override result', result, 'result was not overridden');
//         // },
//
//         'test before and after set cbs are called': function() {
//             let beforeCbCalled = 0,
//                 afterCbCalled = 0,
//                 s = store;
//             store.before('set', 'city', function() {
//                 beforeCbCalled++;
//             });
//             store.after('set', 'city', function() {
//                 afterCbCalled++;
//             });
//
//             store.set('city', 'Cupertino');
//
//             a.areSame(1, beforeCbCalled, 'before cb never called');
//             a.areSame(1, afterCbCalled, 'after cb never called');
//         },
//
//         // GET
//
//         // 'test before get cb is called before get occurs, and I can override the key': function() {
//         //     let called = 0, result;
// 		//
//         //     store.set('city', 'Cupertino');
//         //     store.set('city2', 'Cupertino2');
// 		//
//         //     store.before('get', 'city', function(key) {
//         //         called++;
//         //         a.areSame('city', key, 'wrong key to cb');
//         //         return [key + '2'];
//         //     });
// 		//
//         //     result = store.get('city');
// 		//
//         //     a.areSame(1, called, 'before cb never called');
//         //     a.areSame('Cupertino2', result, 'override key was not applied');
//         // },
// 		//
//         // 'test after get cb is called after get occurs, and I can override the result': function() {
//         //     let called = 0, result;
// 		//
//         //     store.set('city', 'Cupertino');
// 		//
//         //     store.after('get', 'city', function(value) {
//         //         called++;
//         //         a.areSame('Cupertino', value, 'bad get value in cb');
//         //         return value + '2';
//         //     });
// 		//
//         //     result = store.get('city');
// 		//
//         //     a.areSame(1, called, 'after cb never called');
//         //     a.areSame('Cupertino2', result, 'override value was not applied');
//         // }
//
//     });
//
//     suite.add(staticTests);
//     suite.add(instanceTests);
//     suite.add(eventTests);
//     suite.add(wildcardTests);
//     suite.add(setGetTests);
//     suite.add(beforeAfterTests);
//
// 	Y.Test.Runner.add(suite);
//
// });
