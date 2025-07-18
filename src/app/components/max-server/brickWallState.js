let bricks = [
  { id: 1, name: 'Brick 1' },
  { id: 2, name: 'Brick 2' },
  // Add all brick data here
];

module.exports = {
  getBricks: (req, res) => {
      res.send(bricks);
  },
  removeBrick: (brickId) => {
      bricks = bricks.filter(brick => brick.id !== brickId);
  }
};
