namespace BranchOps.Ai.Abstractions;

public sealed class SequenceCounter : ISequenceCounter
{
    private int _value;

    public int Next() => Interlocked.Increment(ref _value);
}
