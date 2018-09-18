// 重写redux
// CREATESTORE:创建REDUX容器存储公共状态信息（包括创建事件池）

export function createStore(reducer) {
    //=>START存储公共的状态，LISTENERS存储事件池的方法
    let state,
        listeners = [];

    //=>GET-STATE：获取公共信息状态信息
    function getState() {
        //=>返回的信息深拷贝，这样外面获取到的和本身的STATE不是同一个空间，修改状态只能走DISPATCH（REDUX这里处理的是不完善的）
        state = JSON.parse(JSON.stringify(state))
        return state
    }
    //=>subscribe像事件池追加方法
    function subscribe(fn) {
        for(let i= 0;i<listeners.length;i++){
            let listener = listeners[i];
            if (listener === fn){
                return new Function()  //=>返回空函数，别人执行的时候什么都不处理，但是也不会报错（不重复情况下返回删除的函数）
            }

        }
        listeners.push(fn)


        //返回移除方法的操作
        return function unsubscribe() {
            let index = listeners.indexOf(fn);
            if(index >= 0){
                listeners.splice(index,1);
            }
        }
    }
    //=>dispatch 派发任务，通知REDUCER执行
    function dispatch(action) {
        if(!'type' in action){
            throw new SyntaxError('必须要有 type')
        }
        try{
            state = reducer(state,action)
            //通知事件池中的方法执行---
                        // 性能优化处理，检测处理应该是检测状态是否发生变化，改变我们才会执行，否则执行方法没啥意义
            for(let i = 0;i<listeners.length;i++){
                let listener = listeners[i]
                typeof listener === "function"?listener():null;
            }
        }catch (e) {
            throw new SyntaxError('reducer执行发生异常')
        }
    }
    //=>开始创建REDUX容器时，我们默认先执行一遍dispatch（）---（给容器设置初始值）
    dispatch({
        type:`@@redux/INIT${Math.random()}`//随机
    })

    // return出方法
    return {
        getState,
        subscribe,
        dispatch
    }
}