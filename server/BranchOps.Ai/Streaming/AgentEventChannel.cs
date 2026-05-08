using System.Threading.Channels;

namespace BranchOps.Ai.Streaming;

public sealed class AgentEventChannel
{
    private readonly Channel<AgentEvent> _channel = Channel.CreateUnbounded<AgentEvent>(
        new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

    public ChannelWriter<AgentEvent> Writer => _channel.Writer;
    public ChannelReader<AgentEvent> Reader => _channel.Reader;
}
