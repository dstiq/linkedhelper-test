/**
 * LEVEL 1.
 Есть склад спец. одежды разных размеров.
 К нам приходит заказ на спец. одежду, в котором указывается для каждого рабочего его id: number, size: [s1: number] | [s1: number, s2: s1+1],
 а также masterSize: 's1' | 's2', если указано два возможных рамера.
 То есть по каждому рабочему может быть указан либо один подходящий размер одежды, либо два, причем 2-ой размер только на 1 больше первого.

 Нужно написать функцию processOrder, которая бы на получила на вход:
 1) массив доступных размеров спец. одежды
 store: Array<{ size: number, quantity: number}>
 2) Заказ на спец. одежду для сотрудников:
 order: Array<{ id: number, size: [s1: number] } | { id: number, size: [s1: number, s2: s1+1], masterSize: 's1' | 's2'  }>

 На выходе функция должна выдать false,
 если на складе недостаточно одежды на обеспечение всех сотрудников,
 а если это возможно, то возвращала объект:
 {
 stats: Array<{size: number, quantity: number}>,
 assignment:  Array<{id: number, size: number}>,
 mismatches: number
 }
 где
 stats - упорядоченный массив по возрастанию size массив размеров выдаваемой одежды со склада,
 assignment - массив распределения одежды по сотрудникам,
 mismatches - по скольким элементам заказа была выдана одежда НЕ соответствующая masterSize.

 processOrder должна расчитывать такое возможное распределение одежды, чтобы mismatches был минимальным.

 Для проверки работоспособности функции запустить runTests()

 @param store: Array<{ size: number, quantity: number}>
 @param order: Array<{ id: number, size: [s1: number] } | { id: number, size: [s1: number, s2: s1+1], masterSize: 's1' | 's2'  }>
 @return false | {
  stats: Array<{size: number, quantity: number}>,
  assignment:  Array<{id: number, size: number}>,
  mismatches: number
  }
 */
function processOrder(store, order) {
  const result = { stats: [], assignment: [], mismatches: 0 };

  let mismatches = 0;
  const statsMap = new Map();
  const storeMap = new Map(store.map(({ size, quantity }) => [size, quantity]));

  function getSizeFromStore(size) {
    if (storeMap.has(size) && storeMap.get(size) > 0) {
      return size;
    }
    return null;
  }

  // Функция для уменьшения количества размера в словаре
  function reduceSizeQuantity(size) {
    if (storeMap.has(size)) {
      storeMap.set(size, storeMap.get(size) - 1);
    }
  }

  function addStatsQuantity(size) {
    if (statsMap.has(size)) {
      statsMap.set(size, statsMap.get(size) + 1);
    } else {
      statsMap.set(size, 1);
    }
  }

  function assignOrder(id, size) {
    reduceSizeQuantity(size);
    result.assignment.push({ id, size });
    addStatsQuantity(size);
  }

  order.sort((a,b) => {
    return a.size.join('') - b.size.join('')
  });

  for (const {
    id,
    size: [s1, s2],
    masterSize,
  } of order) {
    let assignedSize = null;
    if (s2 === undefined) {
      assignedSize = getSizeFromStore(s1);
      if (assignedSize === null) {
        return false;
      }
      assignOrder(id, assignedSize)
    } else {
      const preffered = masterSize === "s1" ? s1 : s2;
      const alternate = masterSize === "s1" ? s2 : s1;

      if (storeMap.has(preffered) && storeMap.get(preffered) > 0) {
        assignedSize = preffered;
        assignOrder(id, assignedSize)
      } else if (storeMap.has(alternate) && storeMap.get(alternate) > 0) {
        assignedSize = alternate;
        assignOrder(id, assignedSize)
        mismatches++;
      } else {
        return false;
      }
    }
  }

  result.mismatches = mismatches;
  result.stats = [...statsMap].map(([size, quantity]) => ({ size, quantity }));
  return result;
}

function compareNumericArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  arr1 = [...arr1].sort();
  arr2 = [...arr2].sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

function compareArraysOfNumericArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let el1 of arr1) {
    if (arr2.findIndex((el2) => compareNumericArrays(el1, el2)) < 0) {
      return false;
    }
  }

  return true;
}

runTests();

function runTests() {
  const tests = [
    // ////////////////////////////
    {
      store: [{ size: 2, quantity: 1 }],
      order: [{ id: 102, size: [1, 2], masterSize: "s1" }],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [{ size: 2, quantity: 1 }],
      order: [{ id: 102, size: [1, 2], masterSize: "s2" }],
      isPosible: true,
      mismatches: 0,
    },
    //////////////////////////////////
    {
      store: [{ size: 3, quantity: 1 }],
      order: [{ id: 102, size: [1, 2], masterSize: "s1" }],
      isPosible: false,
      mismatches: 0,
    },
    //////////////////////////////////
    {
      store: [{ size: 2, quantity: 4 }],
      order: [
        { id: 101, size: [2] },
        { id: 102, size: [1, 2], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 0,
    },
    {
      store: [{ size: 2, quantity: 4 }],
      order: [
        { id: 101, size: [2] },
        { id: 102, size: [1, 2], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 1 },
      ],
      order: [
        { id: 101, size: [2] },
        { id: 102, size: [1, 2], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 1 },
      ],
      order: [
        { id: 101, size: [2] },
        { id: 102, size: [1, 2], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 0,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 3, quantity: 1 },
      ],
      order: [
        { id: 101, size: [2] },
        { id: 102, size: [1, 2], masterSize: "s1" },
      ],
      isPosible: false,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s1" },
        { id: 103, size: [1, 2], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 0,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s1" },
        { id: 103, size: [1, 2], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 2,
    },
    //////////////////////////////
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s1" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 3,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 2,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s2" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s2" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 0,
    },
    // //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 1 },
        { size: 3, quantity: 2 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: false,
    },
    // //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s1" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 2,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 3,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s2" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 2,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s2" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s1" },
        { id: 103, size: [1, 2], masterSize: "s2" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 0,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s1" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    {
      store: [
        { size: 1, quantity: 1 },
        { size: 2, quantity: 3 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [2] },
        { id: 102, size: [2, 3], masterSize: "s2" },
        { id: 103, size: [1, 2], masterSize: "s1" },
        { id: 104, size: [4] },
        { id: 105, size: [3, 4], masterSize: "s2" },
      ],
      isPosible: true,
      mismatches: 2,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 2 },
        { size: 2, quantity: 2 },
        { size: 3, quantity: 1 },
        { size: 4, quantity: 2 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [1, 2], masterSize: "s2" },
        { id: 102, size: [1, 2], masterSize: "s1" },
        { id: 103, size: [2] },
        { id: 104, size: [2, 3], masterSize: "s2" },
        { id: 105, size: [4] },
        { id: 106, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 10 },
        { size: 2, quantity: 0 },
        { size: 3, quantity: 0 },
        { size: 4, quantity: 10 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [1, 2], masterSize: "s2" },
        { id: 102, size: [1, 2], masterSize: "s1" },
        { id: 105, size: [4] },
        { id: 106, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 2,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 10 },
        { size: 2, quantity: 10 },
        { size: 3, quantity: 0 },
        { size: 4, quantity: 10 },
      ],
      order: [
        { id: 100, size: [1] },
        { id: 101, size: [1, 2], masterSize: "s2" },
        { id: 102, size: [1, 2], masterSize: "s1" },
        { id: 105, size: [4] },
        { id: 106, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 1,
    },
    //////////////////////////////////
    {
      store: [
        { size: 1, quantity: 10 },
        { size: 2, quantity: 1 },
        { size: 3, quantity: 0 },
        { size: 4, quantity: 10 },
      ],
      order: [
        { id: 100, size: [1, 2], masterSize: "s2" },
        { id: 101, size: [1, 2], masterSize: "s2" },
        { id: 102, size: [1, 2], masterSize: "s1" },
        { id: 105, size: [4] },
        { id: 106, size: [3, 4], masterSize: "s1" },
      ],
      isPosible: true,
      mismatches: 2,
    },
  ];

  let errors = 0;
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    try {
      const result = processOrder(test.store, test.order);

      if (!checkOrderProcessingResult(test, result)) {
        errors++;
        console.log("failed for test#" + i + ":", test, "result", result);
      }
    } catch (e) {
      errors++;
      console.log("failed for test#\" + i + ':'", test, "exception", e.message, e);
    }
  }

  if (errors === 0) {
    console.log("processOrder test successfuly completed");
  } else {
    console.log(`processOrder test failed with ${errors} errors`);
  }
}

function checkOrderProcessingResult(test, result) {
  if (!test.isPosible && !result) {
    //
    return true;
  }

  if ((!test.isPosible || !result) && test.isPosible != result) {
    return false;
  }

  compareStatsAndAssigmnet(result);
  compareOrderAndAssigment(test.order, result.assignment);
  compareStoreAndStats(test.store, result.stats);
  compareMissmatchesAndAssigment(test.order, result.assignment, result.mismatches);

  if (test.mismatches !== result.mismatches) {
    throw new Error(`Wanted.mismatches=${test.mismatches}, result.mismatches=${result.mismatches}`);
  }

  return true;
}

function compareStatsAndAssigmnet(result) {
  const { stats, assignment } = result;

  const calcStatsMap = new Map();
  for (const ass of assignment) {
    const m = calcStatsMap.get(ass.size);
    calcStatsMap.set(ass.size, (m || 0) + 1);
  }

  const calcStatsArr = [...calcStatsMap.entries()].sort((e1, e2) => e1[0] - e2[0]);
  const orignalStatsArr = [...stats].sort((e1, e2) => e1.size - e2.size).filter((e) => e.quantity > 0);

  if (calcStatsArr.length !== orignalStatsArr.length) {
    throw new Error("stats does not correspond to assignment");
  }
}

function compareOrderAndAssigment(order, assignment) {
  for (const o of order) {
    const ass = assignment.find((a) => a.id == o.id);
    if (!ass) {
      throw new Error(`Cannot find assigment for id=${o.id}`);
    }

    if (!o.size.includes(ass.size)) {
      throw new Error(`Assigned wrong size (${ass.size}) for id=${o.id}`);
    }
  }
}

function compareStoreAndStats(store, stats) {
  for (const statsItem of stats) {
    if (statsItem.quantity === 0) {
      continue;
    }

    const storeItem = store.find((storeI) => storeI.size === statsItem.size);
    if (!storeItem) {
      throw new Error(`Cannot find store item for statsItem.size=${statsItem.size}`);
    }

    if (storeItem.quantity < statsItem.quantity) {
      throw new Error(`store item for size=${storeItem.size} has quantity=${storeItem.quantity} < statsItem.quantity=${statsItem.quantity}`);
    }
  }
}

function compareMissmatchesAndAssigment(order, assigment, mismatches) {
  let calculatedMissmatches = 0;

  for (const ass of assigment) {
    const orderItem = order.find((o) => o.id === ass.id);

    if (!orderItem) {
      throw new Error(`Cannot find ordedItem for assigment`);
    }

    if (orderItem.size.length > 1) {
      const wantedSize = orderItem.masterSize === "s1" ? orderItem.size[0] : orderItem.size[1];

      if (wantedSize !== ass.size) {
        ++calculatedMissmatches;
      }
    }
  }

  if (calculatedMissmatches !== mismatches) {
    throw new Error(`assigment missmatched=${calculatedMissmatches} !== result.mismatches=${mismatches}`);
  }
}
